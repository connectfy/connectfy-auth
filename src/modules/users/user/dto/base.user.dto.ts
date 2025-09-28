import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PhoneNumberDto } from './nested/phoneNumber.dto';

export class BaseUserDto {
  // @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  // @Transform(({ value }) => value?.trim())
  // @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  // role: ROLE;

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
}
