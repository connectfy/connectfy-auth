import {
  dateTransform,
  enumTransform,
  stringTransform,
} from '@common/functions/tranform';
import { TOKEN_TYPE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BaseTokenDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: TOKEN_TYPE }),
  )
  @IsEnum(TOKEN_TYPE, {
    message: ValidationMessages.ENUM('type', Object.values(TOKEN_TYPE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('type') })
  type: TOKEN_TYPE;

  @Transform(({ key, value }) => dateTransform({ key, value }))
  @IsDate({ message: ValidationMessages.DATE('expiresAt') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('expiresAt') })
  expiresAt: Date;
}
