import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCatalogueDto {
  @IsString()
  @IsOptional()
  season?: string;

  @IsString()
  @IsOptional()
  gallary?: string;
  galleryId: number | undefined;
}
