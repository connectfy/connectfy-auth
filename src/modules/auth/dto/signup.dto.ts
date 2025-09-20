import { GENDER } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SingupDto {
  @IsString({ message: ValidationMessages.STRING('firstName') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('firstName') })
  firstName: string;

  @IsString({ message: ValidationMessages.STRING('lastName') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('lastName') })
  lastName: string;

  @IsString({ message: ValidationMessages.STRING('username') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  @Matches(/^[^\s.,?()$:;"'{}[\]=+&!\\|/<>`~@#№%^]+$/, {
    message: ValidationMessages.MISMATCH(
      'username',
      '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)',
    ),
  })
  username: string;

  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  @IsString({ message: ValidationMessages.STRING('phoneNumber') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  phoneNumber: string;

  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  @MinLength(8, { message: ValidationMessages.MIN('password', 8) })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>'№_;:/-])[A-Za-z\d@$!%*?&]{8,15}$/,
    { message: ValidationMessages.PASSWORD() },
  )
  password: string;

  @IsEnum(GENDER, {
    message: ValidationMessages.ENUM('gender', Object.keys(GENDER)),
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('gender') })
  gender: GENDER;

  @Type(() => Date)
  @IsDate({ message: ValidationMessages.DATE('birthdayDate') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('birthdayDate') })
  birthdayDate: Date;
}
