import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateCatalogueDto {
  @IsString()
  @IsOptional()
  season?: string;

  @IsString() 
  @IsOptional()
  gallary?: string;
}
