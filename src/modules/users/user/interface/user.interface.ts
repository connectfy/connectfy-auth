import { PROVIDER, ROLE, USER_STATUS } from 'connectfy-shared';
import { IPhoneNumber } from './nested/phoneNumber.interface';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: IPhoneNumber | null;
  status: USER_STATUS;
  isTwoFactorEnabled: boolean;
  timeZone: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnedUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: IPhoneNumber | null;
  status: USER_STATUS;
  isTwoFactorEnabled: boolean;
  timeZone: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}
