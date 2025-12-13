import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages } from 'connectfy-shared';

export class DeactivateAccountDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;
}
