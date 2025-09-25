import { FORGOT_PASSWORD_IDENTIFIER_TYPE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEnum(FORGOT_PASSWORD_IDENTIFIER_TYPE, {
    message: ValidationMessages.ENUM(
      'identifierType',
      Object.keys(FORGOT_PASSWORD_IDENTIFIER_TYPE),
    ),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifierType') })
  identifierType: FORGOT_PASSWORD_IDENTIFIER_TYPE;

  @IsString({ message: ValidationMessages.STRING('identifier') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('identifier') })
  identifier: string;
}
