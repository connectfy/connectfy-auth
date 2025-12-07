import { ValidationMessages } from '@common/constants/validation.messages';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { DELETE_REASON } from '@/src/common/constants/common.enum';

export class DeleteAccountDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: DELETE_REASON }),
  )
  @IsEnum(DELETE_REASON, {
    message: ValidationMessages.ENUM(
      'reason',
      Object.values(DELETE_REASON),
    ),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('reason') })
  reason: DELETE_REASON;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsOptional()
  @IsString({ message: ValidationMessages.STRING('otherReason') })
  otherReason: string | null;
}
