import { HttpStatus, Injectable } from '@nestjs/common';
import { DeletedUserRepository } from './repo/deleted-user.repo';
import { AddDeletedUserDto } from './dto/add.deleted-user.dto';
import { IReturnedDeletedUser } from './interface/deleted-user.interface';
import { RemoveDeletedUserDto } from './dto/remove.deleted-user.dto';
import { BaseException, CLS_KEYS, ExceptionMessages } from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class DeletedUserService {
  constructor(
    private readonly repo: DeletedUserRepository,
    private readonly cls: ClsService,
  ) {}

  async create(data: AddDeletedUserDto): Promise<IReturnedDeletedUser> {
    const res = await this.repo.create(data);

    return res;
  }

  async remove(data: RemoveDeletedUserDto): Promise<IReturnedDeletedUser> {
    const language = await this.cls.get(CLS_KEYS.LANG);
    const { _id } = data;

    const foundData = await this.repo.findOne({ query: { _id } });

    if (!foundData)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(language),
        HttpStatus.NOT_FOUND,
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
