import { Inject, Logger, forwardRef } from "@nestjs/common";
import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";
import { AppBuilderService } from "./app-builder.service";
import type { AppBuilderConnectionState, AppBuilderStep } from "@relevance/shared";

@WebSocketGateway({ namespace: "app-builder", cors: { origin: true } })
export class AppBuilderGateway implements OnGatewayConnection {
  private readonly logger = new Logger(AppBuilderGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    @Inject(forwardRef(() => AppBuilderService))
    private readonly service: AppBuilderService,
  ) {}

  async handleConnection(client: Socket) {
    const query = client.handshake.query as Record<string, string | string[]>;
    const raw = query["connectionId"] as string | string[] | undefined;
    const connectionId =
      typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
    if (!connectionId) {
      this.logger.warn(
        "Missing connectionId in handshake, disconnecting client",
      );
      client.disconnect(true);
      return;
    }
    const record = this.service.get(connectionId);
    if (!record) {
      this.logger.warn(
        `Unknown connectionId ${connectionId}, disconnecting client`,
      );
      client.disconnect(true);
      return;
    }
    this.service.attachSocket(connectionId, client.id);
    await client.join(connectionId);
    client.emit("connected", { connectionId });
    client.on("get_state", () => {
      const env = this.service.getEnvelope(connectionId);
      if (env) client.emit("state", env);
    });
    const env = this.service.getEnvelope(connectionId);
    if (env) client.emit("state", env);
    this.logger.log(`Client ${client.id} attached to ${connectionId}`);
  }

  emitStepPatch(connectionId: string, payload: { name: string; changes: Partial<Omit<AppBuilderStep, "name">>; seq: number }) {
    this.server.to(connectionId).emit("step_patch", payload);
  }

  emitLogUpdate(connectionId: string, payload: { mode: "append" | "set"; delta: string; seq: number }) {
    this.server.to(connectionId).emit("log_update", payload);
  }
}
