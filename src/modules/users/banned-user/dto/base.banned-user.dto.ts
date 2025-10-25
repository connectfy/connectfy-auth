import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { dateTransform, stringTransform } from '@common/functions/tranform';

export class BaseBannedUserDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('userId') })
  @IsString({ message: ValidationMessages.STRING('userId') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('userId') })
  userId: string;

  @Transform(({ key, value }) => dateTransform({ key, value }))
  @IsDate({ message: ValidationMessages.DATE('bannedToDate') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('bannedToDate') })
  bannedToDate: Date;
}
