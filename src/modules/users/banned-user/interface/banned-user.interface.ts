export interface IBannedUser {
  _id: string;
  userId: string;
  bannedToDate: Date | null;
}

export interface IReturnedBannedUser {
  _id: string;
  userId: string;
  bannedToDate: Date | null;
}
