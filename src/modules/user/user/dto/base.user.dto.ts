import { PROVIDER, ROLE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class BaseUserDto {
  @IsEnum(ROLE, { message: ValidationMessages.ENUM('role', Object.keys(ROLE)) })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('role') })
  role: ROLE;

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

  @IsString({ message: ValidationMessages.STRING('phoneNumber') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  phoneNumber: string;
}
