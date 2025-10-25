import { BaseUserDto } from './base.user.dto';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { arrayTransform, stringTransform } from '@common/functions/tranform';

export class EditUserDto extends PartialType(BaseUserDto) {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsOptional()
  @IsArray({ message: ValidationMessages.ARRAY('faceDescriptor') })
  @IsNumber(
    { allowNaN: false },
    { message: ValidationMessages.NUMBER('faceDescriptor') },
  )
  faceDescriptor?: number[] | null;
}
