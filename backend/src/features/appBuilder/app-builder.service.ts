import { BadRequestException, Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";
import type {
  AppBuilderConnectionState,
  AppBuilderFileType,
  AppBuilderStep,
} from "@relevance/shared";
import { AppBuilderGateway } from "./app-builder.gateway";
import { PreFetchDto } from "./dto/pre-fetch.dto";
import { UploadManagerService } from "./upload-manager/upload-manager.service";

type ConnectionRecord = {
  id: string;
  hash: string;
  data: PreFetchDto;
  socketId?: string;
  createdAt: number;
  state: AppBuilderConnectionState;
  seq: number;
  uploadPath?: string;
  expectedBytes?: number;
};

@Injectable()
export class AppBuilderService {
  private readonly logger = new Logger(AppBuilderService.name);
  private readonly records = new Map<string, ConnectionRecord>();

  constructor(
    @Inject(forwardRef(() => AppBuilderGateway))
    private readonly gateway: AppBuilderGateway,
    @Inject(forwardRef(() => UploadManagerService))
    private readonly uploadManager: UploadManagerService,
  ) { }

  createConnection(hash: string, dto: PreFetchDto) {
    // Create a server-side session (connection record) that will track
    // the lifecycle of the app processing workflow, including upload progress,
    // step transitions, and websocket event sequencing.
    const id = randomUUID();
    const record: ConnectionRecord = {
      id,
      hash,
      data: dto,
      createdAt: Date.now(),
      state: this.buildInitialState(dto),
      seq: 0,
    };
    this.records.set(id, record);
    return { connectionId: id };
  }

  attachSocket(id: string, socketId: string) {
    const record = this.records.get(id);
    if (!record) return false;
    record.socketId = socketId;
    this.records.set(id, record);
    return true;
  }

  get(id: string) {
    return this.records.get(id);
  }

  getState(id: string) {
    return this.records.get(id)?.state;
  }

  updateStep(
    id: string,
    stepName: string,
    patch: Partial<Omit<AppBuilderStep, "name">>,
  ) {
    // Apply a partial patch to a named step and broadcast the changes.
    // The gateway only receives the delta, which helps clients update their UI efficiently.
    const record = this.records.get(id);
    if (!record) return false;
    const idx = record.state.steps.findIndex((s) => s.name === stepName);
    if (idx < 0) return false;
    const current = record.state.steps[idx];
    const next: AppBuilderStep = { ...current, ...patch } as AppBuilderStep;
    const changes: Partial<Omit<AppBuilderStep, "name">> = {};
    for (const key of ["progress", "status", "title", "description", "error"] as const) {
      if (next[key] !== current[key]) {
        (changes as any)[key] = next[key];
      }
    }
    record.state = {
      ...record.state,
      steps: [
        ...record.state.steps.slice(0, idx),
        next,
        ...record.state.steps.slice(idx + 1),
      ],
    };
    record.seq += 1;
    this.records.set(id, record);
    this.gateway.emitStepPatch(id, { name: stepName, changes, seq: record.seq });
    return true;
  }

  updateLog(
    id: string,
    patch: { append?: string; set?: string },
  ) {
    const record = this.records.get(id);
    if (!record) return false;
    const prev = record.state.log ?? "";
    let next = prev;
    if (typeof patch.set === "string") {
      next = patch.set;
    } else if (typeof patch.append === "string") {
      next = prev + patch.append;
    }
    record.state = { ...record.state, log: next };
    record.seq += 1;
    this.records.set(id, record);
    this.gateway.emitLogUpdate(id, {
      mode: typeof patch.set === "string" ? "set" : "append",
      delta: typeof patch.set === "string" ? patch.set! : patch.append ?? "",
      seq: record.seq,
    });
    return true;
  }

  getEnvelope(id: string) {
    const record = this.records.get(id);
    if (!record) return undefined;
    return { state: record.state, seq: record.seq } as {
      state: AppBuilderConnectionState;
      seq: number;
    };
  }

  private buildInitialState(dto: PreFetchDto): AppBuilderConnectionState {
    // Build the initial workflow steps based on the requested apk source and file type.
    // This defines the canonical pipeline used by the frontend to render the status timeline.
    const makeStep = (title: string, steps: AppBuilderStep[]): AppBuilderConnectionState => ({
      title,
      steps,
    });
    const waiting = (name: string, title: string, description: string): AppBuilderStep => ({
      name,
      title,
      description,
      status: "waiting",
      progress: 0,
    });
    if (dto.type === "upload-apk") {
      const {filetype,hash} = dto.body!;
      if (filetype === "apk") {
        return makeStep("APK processing", [
          waiting("upload", "Upload The App", "Upload the .apk file to the server"),
          waiting("verify", "Verify The App", "Verify the integrity of the uploaded .apk file"),
        ]);
      }
      else {
        return makeStep(`${filetype} processing`, [
          waiting("upload", `Upload the app`, `Upload the .${filetype} file to the server`),
          waiting("verify", "Verify The App", `Verify the integrity of the uploaded .${filetype} file`),
          waiting("unzip", `Unzip the .${filetype} file`, `Unzip .${filetype} contents`),
          waiting("decompile", `Decompile The App`, `Decompile the .${filetype} file`),
          waiting("compile", `Compile to .apk`, `Compile the decompiled app into a single APK file`),
        ]);
      }
    }
    else {
      throw new BadRequestException(`Unsupported apk source: ${dto.type}`);
    }
  }

  getUploadPath(id: string) {
    // Resolve a stable upload location on disk for the connection.
    // Using a per-connection directory allows safe resume and isolation across concurrent uploads.
    const base = path.join(process.cwd(), "uploads", id);
    const filePath = path.join(base, "file.bin");
    const record = this.records.get(id);
    if (record) {
      record.uploadPath = filePath;
      this.records.set(id, record);
    }
    if (!fs.existsSync(base)) {
      fs.mkdirSync(base, { recursive: true });
    }
    return filePath;
  }

  getUploadedBytes(id: string) {
    // Return the current size of the persisted file to inform resume offset.
    // If the file does not exist yet, we treat the offset as 0.
    const filePath = this.getUploadPath(id);
    try {
      const stat = fs.statSync(filePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  setExpectedBytes(id: string, total: number) {
    // Persist the total expected file size once known (from Content-Range or client header).
    // This enables accurate progress calculations and final completion checks.
    const record = this.records.get(id);
    if (!record) return;
    record.expectedBytes = total;
    this.records.set(id, record);
  }

  // Clean orchestration wrappers for readability in controller/routes
  async handleFetchForDirectAPK(req: any, res: any, connectionId: string, hash: string) {
    await this.uploadManager.handleUpload(req, res, connectionId, hash);
    return await this.uploadManager.handleVerify(connectionId, hash);
  }
}