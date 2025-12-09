import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LANGUAGE, ValidationMessages } from 'connectfy-shared';

export class RestoreAccountDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsOptional()
  @IsString({ message: ValidationMessages.STRING('_lang') })
  _lang?: LANGUAGE;
}
