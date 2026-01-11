import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeletedUserDocument } from '../entity/deleted-user.entity';
import { AddDeletedUserDto } from '../dto/add.deleted-user.dto';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Injectable()
export class DeletedUserRepository extends BaseRepository<
  DeletedUserDocument,
  AddDeletedUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.DELETED)
    private readonly model: Model<DeletedUserDocument>,
  ) {
    super();
  }

  async create(data: AddDeletedUserDto): Promise<DeletedUserDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async remove(id: string): Promise<DeletedUserDocument | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<DeletedUserDocument | null> {
    return await this.model.findOne(query).exec();
  }

  async findMany(query: Record<string, any>): Promise<DeletedUserDocument[]> {
    return await this.model.find(query).exec();
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }
}
