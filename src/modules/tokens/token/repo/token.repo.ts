import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddTokenDto } from '../dto/add.token.dto';
import { UpdateTokenDto } from '../dto/edit.token.dto';
import { TokenDocument } from '../entity/token.entity';
import { BaseRepository } from '../shared/base.repository';
import { FindTokenDto } from '../dto/find.token.dto';
import { COLLECTIONS } from '@/src/common/constants/constants';

export class TokenRepository extends BaseRepository<
  TokenDocument,
  AddTokenDto,
  UpdateTokenDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.TOKEN.TOKENS)
    private readonly model: Model<TokenDocument>,
  ) {
    super();
  }

  async save(data: AddTokenDto): Promise<TokenDocument> {
    const newData = new this.model(data);
    return await newData.save();
  }

  async findOne(data: FindTokenDto): Promise<TokenDocument | null> {
    const { query = {}, populate = [] } = data;
    return await this.model.findOne(query).populate(populate).exec();
  }

  async findMany(options: FindTokenDto): Promise<TokenDocument[]> {
    const {
      query = {},
      fields = '',
      limit = 10,
      skip = 0,
      sort = {},
      populate = [],
    } = options;

    return this.model
      .find(query)
      .select(fields)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .exec();
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
