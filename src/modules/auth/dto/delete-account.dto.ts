import { ValidationMessages } from '@common/constants/validation.messages';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { stringTransform } from '@/src/common/functions/transform';

export class RemoveAccountDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;
}
