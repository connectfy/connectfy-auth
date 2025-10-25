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
import { stringTransform } from '@common/functions/tranform';

export class AddDeletionOrchestorDto extends BaseDeletionOrchestorDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.UUID('email') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.UUID('deletionToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('deletionToken') })
  deletionToken: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsBoolean({ message: ValidationMessages.UUID('emailSent') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('emailSent') })
  emailSent: boolean;
}
