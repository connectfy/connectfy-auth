import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ValidationMessages } from '../constants/validation.messages';
import { arrayTransform, stringTransform } from '../functions/transform';

export class BaseRemoveDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;
}

export class BaseRemoveAllDto {
  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsArray({ message: ValidationMessages.ARRAY('_ids') })
  @ArrayNotEmpty({ message: ValidationMessages.REQUIRED('_ids') })
  @IsString({ each: true, message: ValidationMessages.STRING('_ids[*]') })
  _ids: string[];
}
