import { stringTransform } from '@/src/common/functions/transform';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangePasswordDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,15}$/, {
    message: ValidationMessages.PASSWORD(),
  })
  password: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('resetToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('confirmPassword') })
  confirmPassword: string;
}
