import { TOKEN_TYPE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class AuthenticateUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  password: string;

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
}
