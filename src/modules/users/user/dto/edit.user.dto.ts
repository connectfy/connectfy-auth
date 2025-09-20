import { PartialType } from '@nestjs/mapped-types';
import { BaseUserDto } from './base.user.dto';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';

export class EditUserDto extends PartialType(BaseUserDto) {
  @IsString({ message: ValidationMessages.STRING('_id') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @IsOptional()
  @IsArray({ message: ValidationMessages.ARRAY('faceDescriptor') })
  @IsNumber({}, { each: true, message: ValidationMessages.INT('faceDescriptor[*]') })
  faceDescriptor?: number[] | null;
}
