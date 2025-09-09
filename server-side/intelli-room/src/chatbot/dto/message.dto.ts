import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description: 'The user message to send to the chatbot assistant',
    example: 'Hello! How can you help me?',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
