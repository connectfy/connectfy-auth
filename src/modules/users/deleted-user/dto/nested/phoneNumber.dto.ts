import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { stringTransform } from '@/src/common/functions/transform';

export class PhoneNumberDto {
  @IsString({ message: ValidationMessages.STRING('countryCode') })
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('countryCode') })
  countryCode: string;

  @IsString({ message: ValidationMessages.STRING('number') })
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('number') })
  number: string;

  @IsString({ message: ValidationMessages.STRING('fullPhoneNumber') })
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('fullPhoneNumber') })
  fullPhoneNumber: string;
}
