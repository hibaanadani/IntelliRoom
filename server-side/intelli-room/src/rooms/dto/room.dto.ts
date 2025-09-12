import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsObject } from 'class-validator';
import { MLOutputDto } from './create-room.dto';
import { Type } from 'class-transformer';

export class RoomDto {
  @ApiProperty({
    description: 'The unique ID of the room',
    example: '60c72b2f9b1d8e001c8a4567',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The name of the room', example: 'Living Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The full output from the machine learning model',
    type: MLOutputDto,
  })
  @IsObject()
  @Type(() => MLOutputDto)
  mlOutput: MLOutputDto;

  @ApiProperty({ description: 'URL of the uploaded room image' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    description: 'The date and time the room was created',
    example: '2023-10-27T10:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;
}
