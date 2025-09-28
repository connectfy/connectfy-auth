import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseDeletionOrchestorDto } from './base.deletion-orchestor.dto ';
import { ValidationMessages } from '@common/constants/validation.messages';

export class AddDeletionOrchestorDto extends BaseDeletionOrchestorDto {
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @IsEmail({}, { message: ValidationMessages.UUID('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @IsString({ message: ValidationMessages.UUID('deletionToken') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('deletionToken') })
  deletionToken: string;

  @IsBoolean({ message: ValidationMessages.UUID('emailSent') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('emailSent') })
  emailSent: boolean;
}
