import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeactivatedUserDocument } from '../entity/deactivated-user.entity';
import { AddDeactivatedUserDto } from '../dto/add.deactivated-user.dto';
import { IReturnedDeactivatedUser } from '../interface/deactivated-user.intreface';
import { FindDeactivatedUserDto } from '../dto/find.deactivated-user.dto';

@Injectable()
export class DeactivatedUserRepository {
  constructor(
    @InjectModel('DeactivatedUser')
    private readonly model: Model<DeactivatedUserDocument>,
  ) {}

  async create(data: AddDeactivatedUserDto): Promise<IReturnedDeactivatedUser> {
    const newData = new this.model(data);
    return (await newData.save()).toObject();
  }

  async findOne(
    data: FindDeactivatedUserDto,
  ): Promise<IReturnedDeactivatedUser | null> {
    const { query = {} } = data;
    const doc = await this.model.findOne(query).exec();

    if (doc) return doc.toObject();
    return null;
  }

  async remove(id: string): Promise<IReturnedDeactivatedUser | null> {
    const removedUser = await this.model.findByIdAndDelete(id).exec();

    return removedUser!.toObject();
  }
}
