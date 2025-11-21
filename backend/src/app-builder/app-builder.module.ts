import { Module } from "@nestjs/common";
import { AppBuilderController } from "./app-builder.controller";
import { AppBuilderService } from "./app-builder.service";
import { AppBuilderGateway } from "./app-builder.gateway";

@Module({
  controllers: [AppBuilderController],
  providers: [AppBuilderService, AppBuilderGateway],
  exports: [AppBuilderService],
})
export class AppBuilderModule {}