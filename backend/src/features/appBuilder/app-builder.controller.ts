import { Body, Controller, HttpCode, Post, BadRequestException, Get, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import * as fs from "fs";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppBuilderService } from "./app-builder.service";
import { PreFetchDto } from "./dto/pre-fetch.dto";
import { PreFetchResponseDto } from "./dto/pre-fetch.response.dto";

@ApiTags("app-builder")
@Controller("app-builder")
export class AppBuilderController {
  constructor(private readonly service: AppBuilderService) {}

  @Post("pre-fetch")
  @HttpCode(200)
  @ApiOperation({
    summary: "Prepare for fetching and allocate a WebSocket connectionId",
    description:
      "understand the source and details of the apk being added and allocates a server-side session and returns connectionId.",
  })
  @ApiOkResponse({ type: PreFetchResponseDto })
  preFetch(@Body() dto: PreFetchDto) {
    if (dto.type === "upload-apk") {
      const { hash, filetype } = dto.body!;
      return this.service.createConnection(hash, dto);
    }
    throw new BadRequestException(`Unsupported type: ${dto.type}`);
  }

  @Post("upload")
  @HttpCode(200)
  @ApiOperation({ summary: "Upload file content with resumable support", description: "Streams file bytes to server; supports resume via Content-Range header. Requires query params connectionId and hash." })
  async upload(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query("connectionId") connectionId?: string, @Query("hash") hash?: string) {
    if (!connectionId || !hash) {
      throw new BadRequestException("Missing connectionId or hash");
    }
    await this.service.handleFetchForDirectAPK(req, res, connectionId, hash);
    return;
  }

  @Get("upload/status")
  @HttpCode(200)
  @ApiOperation({ summary: "Get current uploaded offset", description: "Returns uploaded bytes for the given connectionId and hash." })
  status(@Query("connectionId") connectionId?: string, @Query("hash") hash?: string) {
    if (!connectionId || !hash) {
      throw new BadRequestException("Missing connectionId or hash");
    }
    const record = this.service.get(connectionId);
    if (!record) throw new BadRequestException("Invalid connectionId");
    if (record.hash !== hash) throw new BadRequestException("Hash mismatch");
    const uploadedBytes = this.service.getUploadedBytes(connectionId);
    return { uploadedBytes, expectedBytes: record.expectedBytes ?? null };
  }
}
