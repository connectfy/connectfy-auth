import { enumTransform, stringTransform } from '@/src/common/functions/transform';
import {
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  LANGUAGE,
} from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: FORGOT_PASSWORD_IDENTIFIER_TYPE }),
  )
  @IsEnum(FORGOT_PASSWORD_IDENTIFIER_TYPE, {
    message: ValidationMessages.ENUM(
      'identifierType',
      Object.keys(FORGOT_PASSWORD_IDENTIFIER_TYPE),
    ),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifierType') })
  identifierType: FORGOT_PASSWORD_IDENTIFIER_TYPE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('identifier') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifier') })
  identifier: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
