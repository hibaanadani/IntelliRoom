import { PartialType } from '@nestjs/swagger';
import { createUserDto } from './create-user.dto';

export class updateUserDto extends PartialType(createUserDto) {}
