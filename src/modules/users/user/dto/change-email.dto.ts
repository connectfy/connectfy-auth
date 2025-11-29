import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @IsString({ message: ValidationMessages.STRING('email') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;
}
