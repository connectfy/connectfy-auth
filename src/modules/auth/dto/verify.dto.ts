import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { SignupDto } from './signup.dto';
import { LANGUAGE } from '@common/constants/common.enum';

export class VerifySignupDto {
  @IsString({ message: ValidationMessages.STRING('code') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('code') })
  @Length(6, 6, { message: ValidationMessages.INVALID_LENGTH('code', 6) })
  code: string;

  @IsString({ message: ValidationMessages.STRING('verifyCode') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('verifyCode') })
  verifyCode: string;

  @ValidateNested()
  @Type(() => SignupDto)
  unverifiedUser: SignupDto;

  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
