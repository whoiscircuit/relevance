import { ApiProperty } from "@nestjs/swagger";

export class PreFetchResponseDto {
  @ApiProperty({ description: "Allocated WebSocket connection identifier", example: "c2e2b6aa-8d3e-4f49-9c76-5d9f7c6b0a42" })
  connectionId!: string;
}