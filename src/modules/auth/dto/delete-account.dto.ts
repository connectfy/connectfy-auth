import { ValidationMessages } from '@common/constants/validation.messages';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { IUser } from '../../users/user/interface/user.interface';
import { Transform } from 'class-transformer';

export class DeleteAccountDto {
  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;
}

export class RemoveAccountDto {
  @IsString({ message: ValidationMessages.STRING('token') })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  token: string;

  @IsObject({ message: ValidationMessages.REQUIRED('user') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('user') })
  _loggedUser: IUser;
}
