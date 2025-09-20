import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../shared/base.repository';
import { AddBannedUserDto } from '../dto/add.banned-user.dto';
import { BannedUserDocument } from '../entity/banned-user.entity';

@Injectable()
export class BannedUserRepository extends BaseRepository<
  BannedUserDocument,
  AddBannedUserDto
> {
  constructor(
    @InjectModel('BannedUser') private readonly model: Model<BannedUserDocument>,
  ) {
    super();
  }

  async create(data: AddBannedUserDto): Promise<BannedUserDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async remove(id: string): Promise<BannedUserDocument | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<BannedUserDocument | null> {
    return await this.model.findOne(query).exec();
  }

  async findMany(query: Record<string, any>): Promise<BannedUserDocument[]> {
    return await this.model.find(query).exec();
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }
}
