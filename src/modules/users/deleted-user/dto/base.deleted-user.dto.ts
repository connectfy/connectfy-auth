import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DELETE_REASON } from '@/src/common/enums/enums';
import { ValidationMessages } from '@common/constants/validation.messages';
import {
  enumTransform,
  stringTransform,
} from '@/src/common/functions/transform';

export class BaseUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

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
