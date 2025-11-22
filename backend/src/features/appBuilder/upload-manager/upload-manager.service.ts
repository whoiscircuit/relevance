import { Injectable, BadRequestException, Inject, forwardRef } from "@nestjs/common";
import type { Request, Response } from "express";
import * as fs from "fs";
import { createHash } from "crypto";
import { AppBuilderService } from "../app-builder.service";

@Injectable()
export class UploadManagerService {
  constructor(
    @Inject(forwardRef(() => AppBuilderService))
    private readonly appService: AppBuilderService,
  ) {}

  async handleUpload(req: Request, res: Response, connectionId: string, hash: string) {
    const record = this.appService.get(connectionId);
    if (!record) {
      throw new BadRequestException("Invalid connectionId");
    }
    if (record.hash !== hash) {
      throw new BadRequestException("Hash does not match connection record");
    }

    // Determine offsets and expected total
    const current = this.appService.getUploadedBytes(connectionId);
    const range = req.headers["content-range"] as string | undefined;
    let start = 0;
    let end = 0;
    let total = record.expectedBytes ?? 0;
    if (range && /^bytes\s+\d+-\d+\/\d+$/.test(range)) {
      const [, s, e, t] = range.match(/bytes\s+(\d+)-(\d+)\/(\d+)/)!;
      start = parseInt(s, 10);
      end = parseInt(e, 10);
      total = parseInt(t, 10);
      if (!record.expectedBytes) this.appService.setExpectedBytes(connectionId, total);
    } else {
      const headerTotal = req.headers["x-file-size"] as string | undefined;
      total = headerTotal ? parseInt(headerTotal, 10) : 0;
      if (total > 0 && !record.expectedBytes) this.appService.setExpectedBytes(connectionId, total);
      start = current;
      end = start + (parseInt(req.headers["content-length"] as string, 10) || 0) - 1;
    }

    if (start !== current) {
      throw new BadRequestException(`Offset mismatch: server=${current}, client=${start}`);
    }

    const filePath = this.appService.getUploadPath(connectionId);
    const ws = fs.createWriteStream(filePath, { flags: "a" });
    let uploaded = current;
    let lastEmit = Date.now();
    this.appService.updateStep(connectionId, "upload", { status: "running" });
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => {
        uploaded += chunk.length;
        const now = Date.now();
        if (now - lastEmit > 500) {
          const progress = total > 0 ? Math.floor((uploaded / total) * 100) : 0;
          this.appService.updateStep(connectionId, "upload", { progress, description: `${uploaded}/${total} bytes` });
          lastEmit = now;
        }
      });
      const handleError = (err: any) => {
        ws.destroy(); // Ensure file descriptor is closed
        reject(err);
      };
      req.on("error", handleError);
      ws.on("error", handleError);
      ws.on("finish", resolve);
      req.pipe(ws);
    });

    const finalBytes = this.appService.getUploadedBytes(connectionId);
    const isComplete = total > 0 && finalBytes >= total;
    const progress = total > 0 ? Math.floor((finalBytes / total) * 100) : 0;
    this.appService.updateStep(connectionId, "upload", { progress, status: isComplete ? "success" : "running" });
    res.status(200).json({ uploadedBytes: finalBytes, complete: isComplete });
  }

  async handleVerify(connectionId: string, hash: string): Promise<{ ok: boolean; computedHash?: string; mismatch?: boolean; size?: number }> {
    const record = this.appService.get(connectionId);
    if (!record) {
      throw new BadRequestException("Invalid connectionId");
    }
    if (record.hash !== hash) {
      throw new BadRequestException("Hash does not match connection record");
    }

    const filePath = this.appService.getUploadPath(connectionId);
    try {
      const stat = fs.statSync(filePath);
      const size = stat.size;
      const stream = fs.createReadStream(filePath);
      const hasher = createHash("sha256");

      let processed = 0;
      let lastEmit = Date.now();
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => {
          hasher.update(chunk);
          processed += chunk.length;
          const now = Date.now();
          if (now - lastEmit > 500) {
            const progress = Math.min(100, Math.floor((processed / size) * 100));
            this.appService.updateStep(connectionId, "verify", {
              status: "running",
              description: `hashed ${processed}/${size} bytes`,
              progress,
            });
            lastEmit = now;
          }
        });
        stream.on("end", () => resolve());
        stream.on("error", (err) => reject(err));
      });

      const computed = hasher.digest("hex");
      const ok = computed === hash;
      this.appService.updateStep(connectionId, "verify", {
        status: ok ? "success" : "error",
        description: ok ? "hash verified" : "hash mismatch",
        progress: 100,
      });
      return { ok, computedHash: computed, mismatch: !ok, size };
    } catch {
      throw new BadRequestException("Uploaded file not found");
    }
  }
}