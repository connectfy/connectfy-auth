import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';

export class BaseUserDto {
  @IsString({ message: ValidationMessages.STRING('userId') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @IsDate({ message: ValidationMessages.DATE('bannedToDate') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('bannedToDate') })
  bannedToDate: Date;
}
