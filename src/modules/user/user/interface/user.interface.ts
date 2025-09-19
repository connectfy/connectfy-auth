import { PROVIDER, ROLE } from '@common/constants/common.enum';

export interface IUser {
  _id: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  faceDescriptor: string | null;
  phoneNumber: string;
}

export interface IReturnedUser {
  _id?: string;
  username?: string;
  email?: string;
  role?: ROLE;
  provider?: PROVIDER;
  password?: string;
  faceDescriptor?: string | null;
  phoneNumber?: string;
}
