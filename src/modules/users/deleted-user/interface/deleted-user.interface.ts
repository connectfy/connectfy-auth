import { DELETE_REASON, DELETE_REASON_CODE } from 'connectfy-shared';

export interface IDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  reasonCode: DELETE_REASON_CODE | null;
  reasonDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnedDeletedUser {
  _id: string;
  userId: string;
  deletedAt: Date;
  reason: DELETE_REASON;
  reasonCode: DELETE_REASON_CODE | null;
  reasonDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}
