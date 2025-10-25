import { HttpStatus, Injectable } from '@nestjs/common';
import { DeletedUserRepository } from './repo/deleted-user.repo';
import { AddDeletedUserDto } from './dto/add.deleted-user.dto';
import { IReturnedDeletedUser } from './interface/deleted-user.interface';
import { RemoveDeletedUserDto } from './dto/remove.deleted-user.dto';
import { BaseException } from '@common/exceptions/base.exception';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';

@Injectable()
export class DeletedUserService {
  constructor(private readonly repo: DeletedUserRepository) {}

  async create(data: AddDeletedUserDto): Promise<IReturnedDeletedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  async remove(data: RemoveDeletedUserDto): Promise<IReturnedDeletedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ _id });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const res = await this.repo.remove(_id);

    return res as IReturnedDeletedUser;
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<IReturnedDeletedUser | null> {
    const res = await this.repo.findOne(query);
    return res;
  }
}
