import { TOKEN_TYPE } from '@/src/common/enums/enums';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateTokenDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  @MaxLength(1000, { message: ValidationMessages.MAX('token', 1000) })
  token: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: TOKEN_TYPE }),
  )
  @IsEnum(TOKEN_TYPE, { message: ValidationMessages.STRING('type') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('type') })
  type: TOKEN_TYPE;
}
