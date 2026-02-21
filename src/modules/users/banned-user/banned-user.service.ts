import { HttpStatus, Injectable } from '@nestjs/common';
import { BannedUserRepository } from './repo/banned-user.repo';
import { AddBannedUserDto } from './dto/add.banned-user.dto';
import { RemoveBannedUserDto } from './dto/remove.banned-user.dto';
import { IReturnedBannedUser } from './interface/banned-user.interface';
import { ExceptionMessages, BaseException } from 'connectfy-shared';

@Injectable()
export class BannedUserService {
  constructor(private readonly repo: BannedUserRepository) {}

  async create(data: AddBannedUserDto): Promise<IReturnedBannedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  async remove(data: RemoveBannedUserDto): Promise<IReturnedBannedUser> {
    const { _id, _lang } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
      );

    const res = await this.repo.remove({ _id });

    return res;
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<IReturnedBannedUser | null> {
    const res = await this.repo.findOne(query);
    return res;
  }
}
