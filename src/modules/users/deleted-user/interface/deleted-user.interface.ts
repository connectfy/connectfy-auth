import { PROVIDER, ROLE } from "@common/constants/common.enum";
import { IPhoneNumber } from "./phoneNumber.interface";

export interface IDeletedUser {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: ROLE;
  provider: PROVIDER;
  password: string;
  phoneNumber: IPhoneNumber;
  faceDescriptor?: string;
}

export interface IReturnedDeletedUser {
  _id?: string;
  userId?: string;
  username?: string;
  email?: string;
  role?: ROLE;
  provider?: PROVIDER;
  password?: string;
  phoneNumber?: IPhoneNumber;
  faceDescriptor?: string;
  createdAt?: Date;
}
