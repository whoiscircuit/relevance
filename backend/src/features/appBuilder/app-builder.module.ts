import { Module } from "@nestjs/common";
import { AppBuilderController } from "./app-builder.controller";
import { AppBuilderService } from "./app-builder.service";
import { UploadManagerService } from "./upload-manager/upload-manager.service";
import { AppBuilderGateway } from "./app-builder.gateway";

@Module({
  controllers: [AppBuilderController],
  providers: [AppBuilderService, AppBuilderGateway, UploadManagerService],
  exports: [AppBuilderService, UploadManagerService],
})
export class AppBuilderModule {}