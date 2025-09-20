import { PartialType } from '@nestjs/mapped-types';
import { BaseTokenDto } from './base.token.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { Transform } from 'class-transformer';

export class UpdateTokenDto extends PartialType(BaseTokenDto) {
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @IsOptional()
  @IsBoolean({ message: ValidationMessages.BOOLEAN('isUsed') })
  isUsed?: boolean;
}
