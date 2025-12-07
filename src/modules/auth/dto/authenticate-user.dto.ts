import { TOKEN_TYPE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AuthenticateUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsOptional()
  @ValidateIf((obj) => obj.password || obj.type !== TOKEN_TYPE.CHANGE_EMAIL)
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string | null;

  @Transform(({ key, value }) =>
    enumTransform({
      key,
      value,
      enumObject: {
        DELETE_ACCOUNT: TOKEN_TYPE.DELETE_ACCOUNT,
        RESTORE_ACCOUNT: TOKEN_TYPE.RESTORE_ACCOUNT,
        CHANGE_USERNAME: TOKEN_TYPE.CHANGE_USERNAME,
        CHANGE_EMAIL: TOKEN_TYPE.CHANGE_EMAIL,
        CHANGE_PASSWORD: TOKEN_TYPE.CHANGE_PASSWORD,
        CHANGE_PHONE_NUMBER: TOKEN_TYPE.CHANGE_PHONE_NUMBER,
      },
    }),
  )
  @IsEnum(TOKEN_TYPE, {
    message: ValidationMessages.ENUM('type', [
      TOKEN_TYPE.DELETE_ACCOUNT,
      TOKEN_TYPE.RESTORE_ACCOUNT,
      TOKEN_TYPE.CHANGE_USERNAME,
      TOKEN_TYPE.CHANGE_EMAIL,
      TOKEN_TYPE.CHANGE_PASSWORD,
      TOKEN_TYPE.CHANGE_PHONE_NUMBER,
    ]),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('type') })
  type: TOKEN_TYPE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsOptional()
  @ValidateIf((obj) => obj.idToken)
  @IsString({ message: ValidationMessages.STRING('idToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('idToken') })
  idToken: string | null;
}
