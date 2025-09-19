import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { BaseUserDto } from './base.user.dto';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { Transform } from 'class-transformer';

export class AddUserDto extends BaseUserDto {
  @IsString({ message: ValidationMessages.STRING('username') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;
}
