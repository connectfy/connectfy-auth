import { stringTransform } from '@/src/common/functions/transform';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  @MinLength(8, { message: ValidationMessages.MIN('password', 8) })
  @MaxLength(30, { message: ValidationMessages.MAX('password', 30) })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,30}$/, {
    message: ValidationMessages.PASSWORD(),
  })
  password: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('confirmPassword') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('confirmPassword') })
  @MinLength(8, { message: ValidationMessages.MIN('confirmPassword', 8) })
  @MaxLength(30, { message: ValidationMessages.MAX('confirmPassword', 30) })
  confirmPassword: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  @MaxLength(1000, { message: ValidationMessages.MAX('token', 1000) })
  token: string;
}