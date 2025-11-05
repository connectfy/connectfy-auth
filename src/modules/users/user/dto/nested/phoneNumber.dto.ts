import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import { stringTransform } from '@/src/common/functions/transform';

export class PhoneNumberDto {
  @Transform(({ key, value }) => stringTransform({ key ,value }))
  @IsString({ message: ValidationMessages.STRING('countryCode') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('countryCode') })
  @Matches(/^\+\d+$/, {
    message: ValidationMessages.PHONE_CODE('countryCode'),
  })
  countryCode: string;

  @Transform(({ key, value }) => stringTransform({ key ,value }))
  @IsString({ message: ValidationMessages.STRING('number') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('number') })
  @Matches(/^\d+$/, {
    message: ValidationMessages.NUMBER('number'),
  })
  number: string;

  @Transform(({ key, value }) => stringTransform({ key ,value }))
  @IsString({ message: ValidationMessages.STRING('fullPhoneNumber') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('fullPhoneNumber') })
  @Matches(/^\+\d+$/, {
    message: ValidationMessages.FULL_PHONE('fullPhoneNumber'),
  })
  fullPhoneNumber: string;
}
