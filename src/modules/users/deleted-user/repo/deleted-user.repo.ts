import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeletedUserDocument } from '../entity/deleted-user.entity';
import { AddDeletedUserDto } from '../dto/add.deleted-user.dto';
import { COLLECTIONS, BaseRepository } from 'connectfy-shared';
import { IReturnedDeletedUser } from '@modules/users/deleted-user/interface/deleted-user.interface';

@Injectable()
export class DeletedUserRepository extends BaseRepository<
  DeletedUserDocument,
  IReturnedDeletedUser,
  AddDeletedUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.DELETED)
    protected readonly model: Model<DeletedUserDocument>,
  ) {
    super(model);
  }
}
