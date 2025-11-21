import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppBuilderService } from "./app-builder.service";
import { PreUploadDto } from "./dto/pre-upload.dto";
import { PreUploadResponseDto } from "./dto/pre-upload.response.dto";

@ApiTags("app-builder")
@Controller("app-builder")
export class AppBuilderController {
  constructor(private readonly service: AppBuilderService) {}

  @Post("pre-upload")
  @HttpCode(200)
  @ApiOperation({
    summary: "Prepare for upload and allocate a WebSocket connectionId",
    description:
      "Accepts hash and filetype, allocates a server-side session and returns connectionId.",
  })
  @ApiOkResponse({ type: PreUploadResponseDto })
  preUpload(@Body() body: PreUploadDto) {
    const { hash, filetype } = body;
    return this.service.createConnection(hash, filetype);
  }
}
