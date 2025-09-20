import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/base.repository';
import { UserDocument } from '../entity/user.entity';
import { AddUserDto } from '../dto/add.user.dto';
import { EditUserDto } from '../dto/edit.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository<
  UserDocument,
  AddUserDto,
  EditUserDto
> {
  constructor(
    @InjectModel('User') private readonly model: Model<UserDocument>,
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

  async findOne(query: Record<string, any>): Promise<UserDocument | null> {
    return await this.model.findOne(query).exec();
  }

  async findMany(query: Record<string, any>): Promise<UserDocument[]> {
    return await this.model.find(query).exec();
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }

  async existsByField(query: Record<string, any>): Promise<boolean> {
    const exists = await this.model.exists(query).exec();
    return !!exists;
  }
}
