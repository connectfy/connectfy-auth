import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { LANGUAGE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('resetToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('resetToken') })
  resetToken: string;

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

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
