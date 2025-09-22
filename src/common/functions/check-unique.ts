import { HttpStatus } from '@nestjs/common';
import { BaseException } from '../exceptions/base.exception';
import { ExceptionTypes } from '../constants/exception.constants';
import { ExceptionMessages } from '../constants/exception.constants';
import { ICheckActiveUserConflictParams, ICheckRecentlyDeletedConflictParams } from '../interfaces/date.interface';


export function checkRecentlyDeletedConflict(data: ICheckRecentlyDeletedConflictParams): void {
  const {
    users,
    deletedUsers,
    value,
    days = 30
  } = data;
  
  if (!users.length || !deletedUsers.length) return;

  const now = Date.now();
  const timeLimit = days * 24 * 60 * 60 * 1000;

  const isRecentlyDeleted = deletedUsers.some((deleted) => {
    const deletedAt = new Date(deleted.createdAt!).getTime();
    return now - deletedAt <= timeLimit;
  });

  if (isRecentlyDeleted) {
    throw new BaseException(
      ExceptionMessages.ALREADY_EXISTS_MESSAGE(value),
      HttpStatus.CONFLICT,
      ExceptionTypes.CONFLICT,
    );
  }
}


export function checkActiveUserConflict(data: ICheckActiveUserConflictParams): void {
  const { value, userIds, deletedUsers } = data;

  const deletedIds = deletedUsers.map((u) => u._id);
  
  const activeUsers = userIds.map((uId) => {
    if (!deletedIds.includes(uId)) return uId;
  });

  if (activeUsers.length)
    throw new BaseException(
      ExceptionMessages.ALREADY_EXISTS_MESSAGE(value),
      HttpStatus.CONFLICT,
      ExceptionTypes.CONFLICT,
    );
}