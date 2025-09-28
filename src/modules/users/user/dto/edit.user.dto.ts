import { BaseUserDto } from './base.user.dto';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';

export class EditUserDto extends PartialType(BaseUserDto) {
  @IsString({ message: ValidationMessages.STRING('_id') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @IsOptional()
  @IsString({ message: ValidationMessages.REQUIRED('faceDescriptor') })
  faceDescriptor?: string | null;
}
