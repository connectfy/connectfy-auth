import { IsBoolean, IsNotEmpty, IsObject } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { IDeletionOrchestorPart } from '../interface/deletion-orchestor.interface';
import { Transform } from 'class-transformer';
import { objectTransform } from '@/src/common/functions/transform';

export class BaseDeletionOrchestorDto {
  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsObject({ message: ValidationMessages.OBJECT('parts') })
  @IsBoolean({ each: true, message: ValidationMessages.BOOLEAN('boolean') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('parts') })
  parts: IDeletionOrchestorPart;
}
