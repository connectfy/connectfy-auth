import { PROVIDER, ROLE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PhoneNumberDto } from './nested/phoneNumber.dto';

export class BaseUserDto {
  // @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  // @Transform(({ value }) => value?.trim())
  // @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  // role: ROLE;

  @IsEnum(PROVIDER, {
    message: ValidationMessages.ENUM('provider', Object.keys(PROVIDER)),
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('provider') })
  provider: PROVIDER;

  @IsString({ message: ValidationMessages.STRING('password') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;

  @ValidateNested()
  @Type(() => PhoneNumberDto)
  phoneNumber: PhoneNumberDto;
}
