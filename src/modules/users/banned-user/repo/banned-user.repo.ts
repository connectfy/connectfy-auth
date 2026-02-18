import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AddBannedUserDto } from '../dto/add.banned-user.dto';
import { BannedUserDocument } from '../entity/banned-user.entity';
import { COLLECTIONS, BaseRepository } from 'connectfy-shared';
import { IReturnedBannedUser } from '@modules/users/banned-user/interface/banned-user.interface';

@Injectable()
export class BannedUserRepository extends BaseRepository<
  BannedUserDocument,
  IReturnedBannedUser,
  AddBannedUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.BANNED)
    protected readonly model: Model<BannedUserDocument>,
  ) {
    super(model);
  }
}
