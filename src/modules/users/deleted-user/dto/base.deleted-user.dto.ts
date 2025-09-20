import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class BaseUserDto {
  @IsString({ message: ValidationMessages.STRING('userId') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @IsString({ message: ValidationMessages.STRING('username') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;
}
