import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeactivatedUserDocument } from '../entity/deactivated-user.entity';
import { AddDeactivatedUserDto } from '../dto/add.deactivated-user.dto';
import { IReturnedDeactivatedUser } from '../interface/deactivated-user.intreface';
import { COLLECTIONS, BaseRepository } from 'connectfy-shared';

@Injectable()
export class DeactivatedUserRepository extends BaseRepository<
  DeactivatedUserDocument,
  IReturnedDeactivatedUser,
  AddDeactivatedUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.DEACTIVATED)
    protected readonly model: Model<DeactivatedUserDocument>,
  ) {
    super(model);
  }
}
