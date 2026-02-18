import { DELETE_REASON } from 'connectfy-shared';

export interface IDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  otherReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnedDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  otherReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
