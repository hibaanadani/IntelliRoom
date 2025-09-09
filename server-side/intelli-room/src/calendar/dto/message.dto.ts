import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({
    description: 'The user message to send to the calendar assistant',
    example: 'Book a meeting for tomorrow at 2 PM',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}