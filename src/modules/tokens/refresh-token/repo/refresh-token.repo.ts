import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from '../shared/base.repository';
import { RefreshTokenDocument } from '../entity/refresh-token.entity';
import {
  ISaveRefreshToken,
  IUpdateRefreshToken,
} from '../interface/refresh-token.interface';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  RefreshTokenDocument,
  ISaveRefreshToken,
  IUpdateRefreshToken
> {
  constructor(
    @InjectModel('RefreshToken')
    private readonly model: Model<RefreshTokenDocument>,
  ) {
    super();
  }

  async findTokenByUserId(
    userId: string,
  ): Promise<RefreshTokenDocument | null> {
    return await this.model.findOne({ userId }).exec();
  }

  async findByRefreshToken(
    refresh_token: string,
  ): Promise<RefreshTokenDocument | null> {
    return await this.model.findOne({ refresh_token }).exec();
  }

  async findOne(
    query: Record<string, any>,
  ): Promise<RefreshTokenDocument | null> {
    return await this.model.findOne(query);
  }

  async update({
    userId,
    refresh_token,
  }: IUpdateRefreshToken): Promise<RefreshTokenDocument> {
    return (await this.model
      .findOneAndUpdate(
        { userId },
        { refresh_token },
        { new: true, runValidators: true },
      )
      .exec()) as RefreshTokenDocument;
  }

  async save(data: ISaveRefreshToken): Promise<RefreshTokenDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async remove(
    query: Record<string, any>,
  ): Promise<RefreshTokenDocument | null> {
    return await this.model.findOneAndDelete(query).exec();
  }

  async removeMany(query: Record<string, any>): Promise<void> {
    await this.model.deleteMany(query).exec();
  }
}
