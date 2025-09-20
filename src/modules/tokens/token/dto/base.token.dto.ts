import { TOKEN_TYPE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BaseTokenDto {
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @IsString({ message: ValidationMessages.STRING('token') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @IsEnum(TOKEN_TYPE, {
    message: ValidationMessages.ENUM('type', Object.values(TOKEN_TYPE)),
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('type') })
  type: TOKEN_TYPE;

  @IsDate({ message: ValidationMessages.DATE('expiresAt') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('expiresAt') })
  expiresAt: Date;
}
