import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './repo/user.repo';
import { AddUserDto } from './dto/add.user.dto';
import { IReturnedUser } from './interface/user.interface';
import { EditUserDto } from './dto/edit.user.dto';
import { BaseException } from '@common/exceptions/base.exception';
import { RemoveUserDto } from './dto/remove.user.dto';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async create(data: AddUserDto): Promise<IReturnedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  async edit(data: EditUserDto): Promise<IReturnedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ _id });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const newData = await this.repo.update(data);

    return newData as IReturnedUser;
  }

  async remove(data: RemoveUserDto): Promise<IReturnedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ _id });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    const res = this.repo.remove(_id);

    return res as IReturnedUser;
  }

  async findOne(query: Record<string, any>): Promise<IReturnedUser | null> {
    const res = await this.repo.findOne(query);
    return res;
  }

  async existByField(query: Record<string, any>): Promise<boolean> {
    const res = await this.repo.existsByField(query);

    return res;
  }
}
