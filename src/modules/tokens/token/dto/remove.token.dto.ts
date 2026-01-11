import { enumTransform, stringTransform } from '@/src/common/functions/transform';
import { LANGUAGE } from '@/src/common/enums/enums';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RemoveTokenDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
