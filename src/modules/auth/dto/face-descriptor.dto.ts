import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LANGUAGE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { arrayTransform, enumTransform } from '@/src/common/functions/transform';

export class FaceDescriptorDto {
  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsOptional()
  @IsArray({ message: ValidationMessages.ARRAY('faceDescriptor') })
  @ArrayMinSize(1, { message: ValidationMessages.REQUIRED('faceDescriptor') })
  faceDescriptor: number[] | null;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.values(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;

  @IsOptional()
  _loggedUser?: any;
}
