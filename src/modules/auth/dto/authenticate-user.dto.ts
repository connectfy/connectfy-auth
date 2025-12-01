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
        CHANGE_USERNAME: 'CHANGE_USERNAME',
        CHANGE_EMAIL: 'CHANGE_EMAIL',
        CHANGE_PASSWORD: 'CHANGE_PASSWORD',
      },
    }),
  )
  @IsEnum(TOKEN_TYPE, {
    message: ValidationMessages.ENUM('type', [
      'CHANGE_USERNAME',
      'CHANGE_EMAIL',
      'CHANGE_PASSWORD',
    ]),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('type') })
  type: TOKEN_TYPE;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsOptional()
  @ValidateIf((obj) => obj.idToken )
  @IsString({ message: ValidationMessages.STRING('idToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('idToken') })
  idToken: string | null;
}
