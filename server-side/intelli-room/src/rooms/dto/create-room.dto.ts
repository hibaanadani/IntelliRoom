import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class IndividualObjectAnalysisDto {
  @ApiProperty({ description: 'The detected object', example: 'chair' })
  @IsString()
  @IsNotEmpty()
  object: string;

  @ApiProperty({
    description: 'The classification of the object',
    example: 'Good',
  })
  @IsString()
  @IsNotEmpty()
  classification: 'Good' | 'Bad';
}

export class MLOutputDto {
  @ApiProperty({
    description: 'Overall room aesthetic classification',
    example: 'Good Room',
  })
  @IsString()
  @IsNotEmpty()
  overallClassification: string;

  @ApiProperty({ description: 'Analysis of individual objects in the room' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualObjectAnalysisDto)
  individualObjectAnalysis: IndividualObjectAnalysisDto[];

  @ApiProperty({ description: 'Actionable advice from the ML model' })
  @IsArray()
  @IsString({ each: true })
  actionableReport: string[];
}

export class CreateRoomDto {
  @ApiProperty({ description: 'The name of the room', example: 'Living Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The full output from the machine learning model',
    type: MLOutputDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => MLOutputDto)
  mlOutput: MLOutputDto;

  @ApiProperty({ description: 'URL of the uploaded room image' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;
}
