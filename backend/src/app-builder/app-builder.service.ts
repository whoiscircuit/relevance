import { Inject, Injectable, Logger, forwardRef } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  AppBuilderConnectionState,
  AppBuilderFileType,
  AppBuilderStep,
} from "@relevance/shared";
import { AppBuilderGateway } from "./app-builder.gateway";

type ConnectionRecord = {
  id: string;
  hash: string;
  filetype: AppBuilderFileType;
  socketId?: string;
  createdAt: number;
  state: AppBuilderConnectionState;
  seq: number;
};

@Injectable()
export class AppBuilderService {
  private readonly logger = new Logger(AppBuilderService.name);
  private readonly records = new Map<string, ConnectionRecord>();

  constructor(
    @Inject(forwardRef(() => AppBuilderGateway))
    private readonly gateway: AppBuilderGateway,
  ) { }

  createConnection(hash: string, filetype: AppBuilderFileType) {
    const id = randomUUID();
    const record: ConnectionRecord = {
      id,
      hash,
      filetype,
      createdAt: Date.now(),
      state: this.buildInitialState(filetype),
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

  private buildInitialState(filetype: AppBuilderFileType): AppBuilderConnectionState {
    const make = (title: string, steps: AppBuilderStep[]): AppBuilderConnectionState => ({
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

    if (filetype === "apk") {
      return make("APK processing", [
        waiting("upload", "Upload The App", "Upload the .apk file to the server")
      ]);
    }
    else {
      return make(`${filetype} processing`, [
        waiting("upload", `Upload the app`, `Upload the .${filetype} file to the server`),
        waiting("unzip", `Unzip the .${filetype} file`, `Unzip .${filetype} contents`),
        waiting("decompile", `Decompile The App`, `Decompile the .${filetype} file`),
        waiting("compile", `Compile to .apk`, `Compile the decompiled app into a single APK file`),
      ]);
    }
  }
}