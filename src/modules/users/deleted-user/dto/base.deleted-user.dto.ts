import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ROLE } from '@common/constants/common.enum';
import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { ValidationMessages } from '@common/constants/validation.messages';

export class BaseUserDto {
  @IsString({ message: ValidationMessages.STRING('userId') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @IsString({ message: ValidationMessages.STRING('username') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;

  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @IsString({ message: ValidationMessages.STRING('password') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;

  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phoneNumber: PhoneNumberDto;

  @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  role: ROLE;

  @IsString({ message: ValidationMessages.REQUIRED('faceDescriptor') })
  faceDescriptor: string | null;
}
