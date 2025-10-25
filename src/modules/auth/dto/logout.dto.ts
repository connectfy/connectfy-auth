import { ValidationMessages } from '@common/constants/validation.messages';
import { IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';
import { LANGUAGE } from '@common/constants/common.enum';
import { Transform } from 'class-transformer';
import { enumTransform, objectTransform } from '@common/functions/tranform';

export class LogoutDto {
  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsObject({ message: ValidationMessages.OBJECT('_loggedUser') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_loggedUser') })
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
