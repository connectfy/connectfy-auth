import { ValidationMessages } from '@common/constants/validation.messages';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';
import { LANGUAGE } from '@common/constants/common.enum';

export class LogoutDto {
  @IsObject({ message: ValidationMessages.OBJECT('user') })
  _loggedUser: IUser;

  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang: LANGUAGE;
}
