import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddTokenDto } from '../dto/add.token.dto';
import { UpdateTokenDto } from '../dto/edit.token.dto';
import { TokenDocument } from '../entity/token.entity';
import { BaseRepository } from '../shared/base.repository';

export class TokenRepository extends BaseRepository<
  TokenDocument,
  AddTokenDto,
  UpdateTokenDto
> {
  constructor(
    @InjectModel('Token') private readonly model: Model<TokenDocument>,
  ) {
    super();
  }

  async save(data: AddTokenDto): Promise<TokenDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async findOne(query: Record<string, any>): Promise<TokenDocument | null> {
    return await this.model.findOne(query).exec();
  }

  async findMany(query: Record<string, any>): Promise<TokenDocument[]> {
    return await this.model.find(query).exec();
  }

  async update(data: UpdateTokenDto): Promise<TokenDocument | null> {
    const { _id, ...updateData } = data;

    return await this.model
      .findOneAndUpdate(
        { _id },
        { ...updateData },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async remove(query: Record<string, any>): Promise<TokenDocument | null> {
    return await this.model.findOneAndDelete(query).exec();
  }

  async removeMany(query: Record<string, any>): Promise<void> {
    await this.model.deleteMany(query).exec();
  }
}
