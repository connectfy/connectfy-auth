import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DeactivatedUserRepository } from './repo/deactivated-user.repo';
import { UserService } from '../user/user.service';
import {
  BaseException,
  CLS_KEYS,
  ExceptionMessages,
  HttpStatus,
  LANGUAGE,
  USER_STATUS,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';
import { AddDeactivatedUserDto } from './dto/add.deactivated-user.dto';

@Injectable()
export class DeactivatedUsersService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    private readonly cls: ClsService,
    private readonly repo: DeactivatedUserRepository,
  ) {}

  async create(data: AddDeactivatedUserDto): Promise<void> {
    const userData = {
      _id: data.userId,
      status: USER_STATUS.INACTIVE,
    };

    await Promise.all([
      this.repo.create(data),
      this.userService.edit(userData),
    ]);
  }

  async activateUserIfExist(userId: string): Promise<void> {
    const deactivatedUser = await this.repo.findOne({ query: { userId } });
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);

    if (!deactivatedUser) {
      throw new BaseException(
        ExceptionMessages.INVALID_CREDENTIALS(language),
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = {
      _id: userId,
      status: USER_STATUS.ACTIVE,
    };

    Promise.all([
      this.userService.edit(data),
      this.repo.remove({ _id: deactivatedUser._id }),
    ]);
  }
}
