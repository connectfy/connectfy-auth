import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserDocument } from '../entity/user.entity';
import { AddUserDto } from '../dto/add.user.dto';
import { EditUserDto } from '../dto/edit.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { FindUserDto } from '../dto/find.user.dto';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Injectable()
export class UserRepository extends BaseRepository<
  UserDocument,
  AddUserDto,
  EditUserDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.USER.USERS)
    private readonly model: Model<UserDocument>,
  ) {
    super();
  }

  async create(data: AddUserDto): Promise<UserDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async update(data: EditUserDto): Promise<UserDocument | null> {
    const { _id, ...updatedData } = data;

    return await this.model
      .findByIdAndUpdate(_id, updatedData, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return await this.model.findByIdAndDelete(id).exec();
  }

  async findOne(data: FindUserDto): Promise<UserDocument | null> {
    const { query = {}, fields, populate } = data;

    let queryBuilder: Query<UserDocument | null, UserDocument> =
      this.model.findOne(query);

    if (fields) {
      queryBuilder = queryBuilder.select(fields as any);
    }

    if (populate) {
      queryBuilder = queryBuilder.populate(populate as any);
    }

    return queryBuilder.exec();
  }

  async findMany(data: {
    query: Record<string, any>;
    fields?: string;
    populate?: any | any[];
    sort?: Record<string, any>;
    limit?: number;
    skip?: number;
  }): Promise<UserDocument[]> {
    const { query, fields, populate, sort, limit, skip } = data;

    let queryBuilder: Query<UserDocument[], UserDocument> =
      this.model.find(query);

    if (fields) {
      queryBuilder = queryBuilder.select(fields);
    }

    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }

    if (sort) {
      queryBuilder = queryBuilder.sort(sort);
    }

    if (skip) {
      queryBuilder = queryBuilder.skip(skip);
    }

    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    return await queryBuilder.exec();
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }

  async existsByField(query: Record<string, any>): Promise<boolean> {
    const exists = await this.model.exists(query).exec();
    return !!exists;
  }
}
