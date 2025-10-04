import { LANGUAGE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: ValidationMessages.STRING('resetToken') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('resetToken') })
  resetToken: string;

  @IsString({ message: ValidationMessages.STRING('password') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>'№_;:/-])[A-Za-z\d@$!%*?&]{8,15}$/,
    { message: ValidationMessages.PASSWORD() },
  )
  password: string;

  @IsString({ message: ValidationMessages.STRING('resetToken') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('confirmPassword') })
  confirmPassword: string;

  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
