import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LANGUAGE, ROLE } from '@common/constants/common.enum';
import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { ValidationMessages } from '@common/constants/validation.messages';
import { enumTransform, objectTransform, stringTransform } from '@/src/common/functions/transform';

export class BaseUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;
  
  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  phoneNumber: PhoneNumberDto;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  role: ROLE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsOptional()
  @IsString({ message: ValidationMessages.REQUIRED('faceDescriptor') })
  faceDescriptor: string | null;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
