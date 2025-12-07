import {
  arrayTransform,
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { IDENTIFIER_TYPE, LANGUAGE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: IDENTIFIER_TYPE }),
  )
  @IsEnum(IDENTIFIER_TYPE, {
    message: ValidationMessages.ENUM(
      'identifierType',
      Object.keys(IDENTIFIER_TYPE),
    ),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifierType') })
  identifierType: IDENTIFIER_TYPE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('identifier') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifier') })
  identifier: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}

export class GoogleAuthloginDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('idToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('idToken') })
  idToken: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
