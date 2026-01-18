import { Injectable } from '@nestjs/common';
import { UserDocument } from '../entity/user.entity';
import { AddUserDto } from '../dto/add.user.dto';
import { EditUserDto } from '../dto/edit.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { BaseRepository } from '@common/repo/base.repository';
import { IReturnedUser } from '@modules/users/user/interface/user.interface';

@Injectable()
export class UserRepository extends BaseRepository<
  UserDocument,
  IReturnedUser,
  AddUserDto,
  EditUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.USERS)
    protected readonly model: Model<UserDocument>,
  ) {
    super(model);
  }
}
