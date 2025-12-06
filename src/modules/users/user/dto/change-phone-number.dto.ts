import { PHONE_NUMBER_ACTION } from '@/src/common/constants/common.enum';
import {
  enumTransform,
  objectTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages } from 'connectfy-shared';
import { PhoneNumberDto } from './nested/phoneNumber.dto';

export class ChangePhoneNumberDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: PHONE_NUMBER_ACTION }),
  )
  @IsEnum(PHONE_NUMBER_ACTION, {
    message: ValidationMessages.REQUIRED('action'),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('action') })
  action: PHONE_NUMBER_ACTION;

  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsOptional()
  @ValidateIf((obj) => obj.action === PHONE_NUMBER_ACTION.UPDATE)
  @ValidateNested()
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  @Type(() => PhoneNumberDto)
  phoneNumber: PhoneNumberDto;
}
