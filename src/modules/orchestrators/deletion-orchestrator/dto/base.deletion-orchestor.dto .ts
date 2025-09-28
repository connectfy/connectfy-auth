import { IsNotEmpty, IsObject } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { IDeletionOrchestorPart } from '../interface/deletion-orchestor.interface';

export class BaseDeletionOrchestorDto {
  @IsObject({ message: ValidationMessages.OBJECT('parts') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('parts') })
  parts: IDeletionOrchestorPart;
}
