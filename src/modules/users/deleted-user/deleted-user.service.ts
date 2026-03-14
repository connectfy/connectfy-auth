import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DeletedUserRepository } from './repo/deleted-user.repo';
import { AddDeletedUserDto } from './dto/add.deleted-user.dto';
import { IReturnedDeletedUser } from './interface/deleted-user.interface';
import { RemoveDeletedUserDto } from './dto/remove.deleted-user.dto';
import {
  BaseException,
  CLS_KEYS,
  ExceptionMessages,
  LANGUAGE,
  USER_STATUS,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';
import { UserService } from '../user/user.service';

@Injectable()
export class DeletedUserService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly repo: DeletedUserRepository,
    private readonly cls: ClsService,
  ) {}

  async create(data: AddDeletedUserDto): Promise<void> {
    const userData = {
      _id: data.userId,
      status: USER_STATUS.DELETED,
    };

    await Promise.all([
      this.repo.create(data),
      this.userService.edit(userData),
    ]);
  }

  async restoreAccount(userId: string): Promise<void> {
    const deletedAccount = await this.repo.findOne({ query: { userId } });
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (!deletedAccount) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );
    }

    const isUserExist = await this.userService.existByField({ _id: userId });

    if (!isUserExist) {
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
      );
    }

    const userData = {
      _id: userId,
      status: USER_STATUS.ACTIVE,
    };

    await Promise.all([
      await this.repo.remove({ _id: deletedAccount._id }),
      this.userService.edit(userData),
    ]);
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<IReturnedDeletedUser | null> {
    const res = await this.repo.findOne(query);
    return res;
  }
}
