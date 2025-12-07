import { DELETE_REASON } from '@/src/common/constants/common.enum';

export interface IDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  otherReason: string | null;
}

export interface IReturnedDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  otherReason: string | null;
}
