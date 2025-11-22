import { Body, Controller, HttpCode, Post, BadRequestException } from "@nestjs/common";
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
      "Accepts hash, filetype and source type, allocates a server-side session and returns connectionId.",
  })
  @ApiOkResponse({ type: PreFetchResponseDto })
  preFetch(@Body() dto: PreFetchDto) {
    if (dto.type === "upload-apk") {
      const { hash, filetype } = dto.body!;
      return this.service.createConnection(hash, filetype);
    }
    throw new BadRequestException(`Unsupported type: ${dto.type}`);
  }
}
