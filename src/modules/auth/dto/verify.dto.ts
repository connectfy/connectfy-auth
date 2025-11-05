import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { SignupDto } from './signup.dto';
import { LANGUAGE } from '@common/constants/common.enum';
import {
  enumTransform,
  objectTransform,
  stringTransform,
} from '@/src/common/functions/transform';

export class VerifySignupDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('code') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('code') })
  @Length(6, 6, { message: ValidationMessages.INVALID_LENGTH('code', 6) })
  @Matches(/^\d+$/, {
    message: ValidationMessages.NUMBER('operators'),
  })
  code: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('verifyCode') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('verifyCode') })
  verifyCode: string;

  @Transform(({ key, value }) => objectTransform({ key, value }))
  @ValidateNested()
  @Type(() => SignupDto)
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('unverifiedUser') })
  unverifiedUser: SignupDto;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.values(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
