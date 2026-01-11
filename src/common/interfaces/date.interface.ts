import { IReturnedUser } from '@modules/users/user/interface/user.interface';
import { IReturnedDeletedUser } from '@modules/users/deleted-user/interface/deleted-user.interface';
import { LANGUAGE } from '../enums/enums';

export interface ITimestamps {
  createdAt: Date;
  updatedAt?: Date;
}

export interface ICheckRecentlyDeletedConflictParams {
  user: IReturnedUser | null;
  deletedUsers: IReturnedDeletedUser[];
  value: string;
  days?: number;
  _lang: LANGUAGE
}

// export interface ICheckActiveUserConflictParams {
//   value: string;
//   userIds: string[];
//   deletedUsers: IReturnedDeletedUser[];
// }
