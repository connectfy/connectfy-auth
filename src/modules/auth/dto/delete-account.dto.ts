import { ValidationMessages } from '@common/constants/validation.messages';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';
import { Transform } from 'class-transformer';
import { LANGUAGE } from '@common/constants/common.enum';
import {
  enumTransform,
  objectTransform,
  stringTransform,
} from '@common/functions/tranform';

export class DeleteAccountDto {
  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}

export class RemoveAccountDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
