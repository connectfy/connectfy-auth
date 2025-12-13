import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ValidationMessages } from 'connectfy-shared';

export class RemoveDeactivatedUserRepo {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;
}
