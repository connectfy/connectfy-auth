import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
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
    message: ValidationMessages.NUMBER('code'),
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

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('deviceId') })
  @IsUUID('4', { message: ValidationMessages.UUID('deviceId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('deviceId') })
  deviceId: string;

  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsOptional()
  @IsObject({ message: ValidationMessages.OBJECT('requestData') })
  requestData: {
    headers: {
      'user-agent'?: string | string[];
      'x-forwarded-for'?: string | string[];
      'x-real-ip'?: string | string[];
      'cf-connecting-ip'?: string | string[];
    };
    ip?: string;
  };
}
