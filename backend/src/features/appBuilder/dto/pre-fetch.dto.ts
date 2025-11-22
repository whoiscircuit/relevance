import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsIn, IsNotEmpty, IsObject, IsString, Matches, ValidateIf, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import type { AppBuilderFileType, ApkSourceNames } from "@relevance/shared";
import { apkSources } from "@relevance/shared";

export class PreFetchUploadApkBodyDto {
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

export class PreFetchDto {
  @ApiProperty({ description: "APK source type", example: "upload-apk", enum: apkSources.map(s => s.value) })
  @IsString()
  @IsNotEmpty()
  @IsIn(apkSources.map((s) => s.value))
  type!: ApkSourceNames;

  @ApiProperty({ description: "Request body for upload-apk type", required: false, type: () => PreFetchUploadApkBodyDto })
  @ValidateIf((o) => o.type === "upload-apk")
  @IsDefined()
  @IsObject()
  @ValidateNested()
  @Type(() => PreFetchUploadApkBodyDto)
  body?: PreFetchUploadApkBodyDto;
}
