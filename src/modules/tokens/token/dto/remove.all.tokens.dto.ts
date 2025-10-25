import { arrayTransform, enumTransform } from '@common/functions/tranform';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { LANGUAGE } from '@common/constants/common.enum';

export class RemoveAllTokensDto {
  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsArray({ message: ValidationMessages.ARRAY('_ids') })
  @ArrayNotEmpty({ message: ValidationMessages.REQUIRED('_ids') })
  @IsString({ each: true, message: ValidationMessages.STRING('_ids[*]') })
  _ids: string[];

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
