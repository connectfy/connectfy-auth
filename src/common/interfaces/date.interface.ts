import { IReturnedDeletedUser } from '@modules/users/deleted-user/interface/deleted-user.interface';

export interface ITimestamps {
  createdAt: Date;
  updatedAt?: Date;
}

export interface ICheckRecentlyDeletedConflictParams {
  users: { _id: string }[];
  deletedUsers: IReturnedDeletedUser[];
  value: string;
  days?: number;
}
