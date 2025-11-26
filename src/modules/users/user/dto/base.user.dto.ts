import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
// import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { LANGUAGE } from '@common/constants/common.enum';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';

export class BaseUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @Transform(({ key, value }) => stringTransform({ key, value }))
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
