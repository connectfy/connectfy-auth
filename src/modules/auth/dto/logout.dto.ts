import { ValidationMessages } from '@common/constants/validation.messages';
import { IsObject } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';

export class LogoutDto {
  @IsObject({ message: ValidationMessages.OBJECT('user') })
  _loggedUser: IUser;
}
