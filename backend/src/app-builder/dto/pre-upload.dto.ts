import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, Matches } from "class-validator";
import type { AppBuilderFileType } from "@relevance/shared";

export class PreUploadDto {
  @ApiProperty({
    description: "SHA-256 hex hash of the file",
    example: "a3f5...",
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{64}$/i, { message: "hash must be a 64-char hex SHA-256" })
  hash!: string;

  @ApiProperty({ description: "File type identifier", example: "apk", enum: ["apk", "xapk", "apks"] })
  @IsString()
  @IsNotEmpty()
  @IsIn(["apk", "xapk", "apks"])
  filetype!: AppBuilderFileType;
}
