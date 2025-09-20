import { PROVIDER, ROLE } from '@common/constants/common.enum';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: string;
  faceDescriptor?: string;
}

export interface IReturnedUser {
  _id?: string;
  username?: string;
  email?: string;
  role?: ROLE;
  provider?: PROVIDER;
  password?: string;
  phoneNumber?: string;
  faceDescriptor?: string;
}
