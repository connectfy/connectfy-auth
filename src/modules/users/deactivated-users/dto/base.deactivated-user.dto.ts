import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ValidationMessages } from '@/src/common/constants/validation.messages';

export class BaseDeactivatedUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;
}
