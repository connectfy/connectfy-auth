import { ValidationMessages } from '@common/constants/validation.messages';
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';
import { Transform } from 'class-transformer';
import { LANGUAGE } from '@common/constants/common.enum';

export class DeleteAccountDto {
  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;

  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}

export class RemoveAccountDto {
  @IsString({ message: ValidationMessages.STRING('token') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;

  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
