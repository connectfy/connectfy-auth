import { PartialType } from '@nestjs/mapped-types';
import { BaseTokenDto } from './base.token.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { booleanTransform, stringTransform } from '@common/functions/tranform';

export class UpdateTokenDto extends PartialType(BaseTokenDto) {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @Transform(({ key, value }) => booleanTransform({ key, value }))
  @IsOptional()
  @IsBoolean({ message: ValidationMessages.BOOLEAN('isUsed') })
  isUsed?: boolean;
}
