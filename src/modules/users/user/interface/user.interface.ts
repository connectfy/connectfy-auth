import { PROVIDER, ROLE, USER_STATUS } from '@common/constants/common.enum';
import { IPhoneNumber } from './phoneNumber.interface';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: IPhoneNumber | null;
  faceDescriptor: string | null;
  status: USER_STATUS;
}

export interface IReturnedUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: IPhoneNumber;
  faceDescriptor: string | null;
  status: USER_STATUS;
}
