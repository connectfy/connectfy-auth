export interface IBannedUser {
  _id: string;
  userId: string;
  bannedToDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnedBannedUser {
  _id: string;
  userId: string;
  bannedToDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
