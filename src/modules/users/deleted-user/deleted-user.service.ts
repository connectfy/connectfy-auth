import { HttpStatus, Injectable } from '@nestjs/common';
import { DeletedUserRepository } from './repo/deleted-user.repo';
import { AddDeletedUserDto } from './dto/add.deleted-user.dto';
import { IReturnedDeletedUser } from './interface/deleted-user.interface';
import { RemoveDeletedUserDto } from './dto/remove.deleted-user.dto';
import {
  BaseException,
  ExceptionMessages,
  ExceptionTypes,
} from 'connectfy-shared';

@Injectable()
export class DeletedUserService {
  constructor(private readonly repo: DeletedUserRepository) {}

  async create(data: AddDeletedUserDto): Promise<IReturnedDeletedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  async remove(data: RemoveDeletedUserDto): Promise<IReturnedDeletedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const res = await this.repo.remove({ _id });

    return res;
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<IReturnedDeletedUser | null> {
    const res = await this.repo.findOne(query);
    return res;
  }
}
