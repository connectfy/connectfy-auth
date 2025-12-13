export interface IDeactivatedUser {
  _id: string;
  userId: string;
}

export interface IReturnedDeactivatedUser {
  _id: string;
  userId: string;
  createdAt: Date;
}
