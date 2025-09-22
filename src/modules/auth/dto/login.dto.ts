import { GOOGLE_AUTH_LOGIN_TYPE, IDENTIFIER_TYPE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEnum(IDENTIFIER_TYPE, {
    message: ValidationMessages.ENUM(
      'identifierType',
      Object.keys(IDENTIFIER_TYPE),
    ),
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifierType') })
  identifierType: IDENTIFIER_TYPE;

  @IsString({ message: ValidationMessages.STRING('identifier') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifier') })
  identifier: string;

  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;
}

export class GoogleAuthloginDto {
  @IsString({ message: ValidationMessages.STRING('idToken') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('idToken') })
  idToken: string;
}