import { GENDER, LANGUAGE } from '@common/constants/common.enum';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
// import { PhoneNumberDto } from '../../users/user/dto/nested/phoneNumber.dto';
import {
  dateTransform,
  enumTransform,
  objectTransform,
  stringTransform,
} from '@common/functions/tranform';

export class SignupDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('firstName') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('firstName') })
  firstName: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('lastName') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('lastName') })
  lastName: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: ValidationMessages.MISMATCH(
      'username',
      '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)',
    ),
  })
  username: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsEmail({}, { message: ValidationMessages.EMAIL('email') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('email') })
  email: string;

  // @Transform(({ key, value }) => objectTransform({ key, value }))
  // @ValidateNested()
  // @Type(() => PhoneNumberDto)
  // @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  // phoneNumber: PhoneNumberDto;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('password') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('password') })
  @MinLength(8, { message: ValidationMessages.MIN('password', 8) })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>'№_;:/-])[A-Za-z\d@$!%*?&]{8,15}$/,
    { message: ValidationMessages.PASSWORD() },
  )
  password: string;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: GENDER }),
  )
  @IsEnum(GENDER, {
    message: ValidationMessages.ENUM('gender', Object.keys(GENDER)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('gender') })
  gender: GENDER;

  @Transform(({ key, value }) => dateTransform({ key, value }))
  @IsDate({ message: ValidationMessages.DATE('birthdayDate') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('birthdayDate') })
  birthdayDate: Date;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}

export class GoogleAuthSignupDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('idToken') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('idToken') })
  idToken: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  @Matches(/^[^\s.,?()$:;"'{}[\]=+&!\\|/<>`~@#№%^]+$/, {
    message: ValidationMessages.MISMATCH(
      'username',
      '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)',
    ),
  })
  username: string;

  // @Transform(({ key, value }) => objectTransform({ key, value }))
  // @ValidateNested()
  // @Type(() => PhoneNumberDto)
  // @IsNotEmpty({ message: ValidationMessages.STRING("phoneNumber") })
  // phoneNumber: PhoneNumberDto;

  @Transform(({ key, value }) => enumTransform({ key, value, enumObject: GENDER }))
  @IsEnum(GENDER, {
    message: ValidationMessages.ENUM('gender', Object.keys(GENDER)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('gender') })
  gender: GENDER;

  @Transform(({ key, value }) => dateTransform({ key, value }))
  @IsDate({ message: ValidationMessages.DATE('birthdayDate') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('birthdayDate') })
  birthdayDate: Date;

  @Transform(({ key, value }) => enumTransform({ key, value, enumObject: LANGUAGE }))
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
