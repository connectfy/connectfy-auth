import { Document, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import {
  IBaseRepositoryInterface,
  IBaseRepositoryOptions,
  IBaseRepositoryRemoveOptions,
  IBaseRepositoryUpdateOptions,
} from '../interfaces/intrefaces';
import { BaseRemoveAllDto, BaseRemoveDto } from '../dto/base.remove.dto';
import { BaseFindDto } from '../dto/base.find.dto';

export abstract class BaseRepository<
  TDocument extends Document,
  TInterface extends IBaseRepositoryInterface,
  CreateDto = Partial<TDocument>,
  UpdateDto = any,
> {
  protected constructor(protected readonly model: Model<TDocument>) {}

  // ================================================
  // CREATE AND CREATE MANY FUNCTIONS
  // ================================================
  async create(
    data: CreateDto,
    opts?: IBaseRepositoryOptions,
  ): Promise<TInterface> {
    const newData = new this.model(data);
    let saved = await newData.save();

    if (opts?.populate) {
      saved = await saved.populate(opts.populate);
    }

    return saved.toObject({ versionKey: false }) as unknown as TInterface;
  }

  async createMany(
    data: CreateDto[],
    opts?: IBaseRepositoryOptions,
  ): Promise<TInterface[]> {
    const inserted = await this.model.insertMany(data, {
      lean: true,
      ordered: false,
    });

    if (opts?.populate) {
      const ids = inserted.map((doc: any) => doc._id);
      const populated = await this.model
        .find({ _id: { $in: ids } })
        .populate(
          opts.populate as PopulateOptions | string[] | PopulateOptions[],
        )
        .lean()
        .exec();

      return populated as TInterface[];
    }

    return inserted as TInterface[];
  }

  // ================================================
  // UPDATE AND UPDATE MANY FUNCTIONS
  // ================================================
  async update(
    query: Record<string, any>,
    data: UpdateDto,
    opts?: IBaseRepositoryUpdateOptions,
  ): Promise<TInterface> {
    const updateOptions = {
      upsert: opts?.upsert ?? false,
      new: opts?.new ?? true,
      runValidators: opts?.runValidators ?? true,
      populate: opts?.populate ?? [],
      lean: opts?.lean ?? false,
    };

    const updatedData = await this.model.findOneAndUpdate(
      query,
      data as UpdateQuery<TDocument>,
      updateOptions,
    );

    return updatedData as TInterface;
  }

  async updateMany(
    query: Record<string, any>,
    data: UpdateDto,
    opts?: IBaseRepositoryUpdateOptions,
  ): Promise<{
    matchedCount: number;
    modifiedCount: number;
    acknowledged: boolean;
  }> {
    const updateOptions = {
      upsert: opts?.upsert ?? false,
      runValidators: opts?.runValidators ?? true,
    };

    const result = await this.model.updateMany(
      query,
      data as UpdateQuery<TDocument>,
      updateOptions,
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
    };
  }

  // ================================================
  // REMOVE AND REMOVE MANY FUNCTIONS
  // ================================================
  async remove(
    data: BaseRemoveDto,
    opts?: IBaseRepositoryRemoveOptions,
  ): Promise<TInterface> {
    if (opts?.lean) {
      return (await this.model
        .findByIdAndDelete(data._id)
        .lean()
        .exec()) as TInterface;
    }
    return (await this.model.findByIdAndDelete(data._id).exec()) as TInterface;
  }

  async removeOne(
    query: Record<string, any>,
    opts?: IBaseRepositoryRemoveOptions,
  ): Promise<TInterface> {
    if (opts?.lean) {
      return (await this.model
        .findOneAndDelete(query)
        .lean()
        .exec()) as TInterface;
    }
    return (await this.model.findOneAndDelete(query).exec()) as TInterface;
  }

  async removeMany(
    data: BaseRemoveAllDto,
    opts?: IBaseRepositoryRemoveOptions,
  ): Promise<TInterface[]> {
    if (opts?.lean) {
      return (await this.model
        .deleteMany({ _id: { $in: data._ids } })
        .lean()
        .exec()) as unknown as TInterface[];
    }

    return (await this.model
      .deleteMany({ _id: { $in: data._ids } })
      .exec()) as unknown as TInterface[];
  }

  async removeAll(
    query: Record<string, any>,
    opts?: IBaseRepositoryRemoveOptions,
  ): Promise<TInterface[]> {
    if (opts?.lean) {
      return (await this.model
        .deleteMany(query)
        .lean()
        .exec()) as unknown as TInterface[];
    }

    return (await this.model
      .deleteMany(query)
      .exec()) as unknown as TInterface[];
  }

  // ================================================
  // FINE ONE AND FIND MANY FUNCTIONS
  // ================================================
  async findOne(params: BaseFindDto = {}): Promise<TInterface | null> {
    const {
      query = {},
      fields = '',
      sort = { createdAt: -1 },
      populate = [],
    } = params;

    return (await this.model
      .findOne(query)
      .select(fields)
      .sort(sort)
      .populate(populate)
      .lean()
      .exec()) as TInterface | null;
  }

  async findOneById(
    _id: string,
    params: BaseFindDto = {},
  ): Promise<TInterface | null> {
    const { fields = '', sort = { createdAt: -1 }, populate = [] } = params;

    return (await this.model
      .findOne({ _id })
      .select(fields)
      .sort(sort)
      .populate(populate)
      .lean()
      .exec()) as TInterface | null;
  }

  async findOneByUserId(
    userId: string,
    params: BaseFindDto = {},
  ): Promise<TInterface | null> {
    const { fields = '', sort = { createdAt: -1 }, populate = [] } = params;

    return (await this.model
      .findOne({ userId })
      .select(fields)
      .sort(sort)
      .populate(populate)
      .lean()
      .exec()) as TInterface | null;
  }

  async findMany(params: BaseFindDto = {}): Promise<TInterface[]> {
    const {
      query = {},
      fields = '',
      sort = { createdAt: -1 },
      populate = [],
      skip = 0,
      limit = 10,
    } = params;

    return (await this.model
      .findOne(query)
      .select(fields)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .lean()
      .exec()) as TInterface[];
  }

  // ================================================
  // EXIST AND COUNT FUNCTIONS
  // ================================================
  async existsByField(query: Record<string, any>): Promise<boolean> {
    const result = await this.model.exists(query);
    return !!result;
  }

  async count(query: Record<string, any>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }
}
