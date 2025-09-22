import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';

export class PhoneNumberDto {
  @IsString({ message: ValidationMessages.STRING('countryCode') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('countryCode') })
  countryCode: string;

  @IsString({ message: ValidationMessages.STRING('number') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('number') })
  number: string;

  @IsString({ message: ValidationMessages.STRING('fullPhoneNumber') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('fullPhoneNumber') })
  fullPhoneNumber: string;
}
