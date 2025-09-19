export interface IDeletedUser {
  _id: string;
  userId: string;
  username: string;
  email: string;
}

export interface IReturnedDeletedUser {
  _id?: string;
  userId?: string;
  username?: string;
  email?: string;
  createdAt?: Date;
}
