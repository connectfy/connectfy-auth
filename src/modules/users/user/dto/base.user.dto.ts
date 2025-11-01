import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
// import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { LANGUAGE } from '@common/constants/common.enum';
import {
  enumTransform,
  objectTransform,
  stringTransform,
} from '@common/functions/tranform';

export class BaseUserDto {
  // @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  // @Transform(({ value }) => value?.trim())
  // @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  // role: ROLE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;

  // @Transform(({ key, value }) => objectTransform({ key, value }))
  // @ValidateNested()
  // @Type(() => PhoneNumberDto)
  // @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  // phoneNumber: PhoneNumberDto;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
