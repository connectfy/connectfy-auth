export interface IDeletedUser {
  _id: string;
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export interface IReturnedDeletedUser {
  _id?: string;
  userId?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: Date;
}
