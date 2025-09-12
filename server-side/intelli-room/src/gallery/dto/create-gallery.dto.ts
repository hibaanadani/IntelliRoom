import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({
    description: 'The name of the gallery',
    example: 'The Modern Art Collection',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The catalogue PDF file',
    required: false,
  })
  catalogue: any;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The cover image file',
    required: false,
  })
  coverImage: any;
}
