import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshTokenDocument } from '../entity/refresh-token.entity';
import {
  IReturnedRefreshToken,
  ISaveRefreshToken,
  IUpdateRefreshToken,
} from '../interface/refresh-token.interface';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { BaseRepository } from '@common/repo/base.repository';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  RefreshTokenDocument,
  IReturnedRefreshToken,
  ISaveRefreshToken,
  IUpdateRefreshToken
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.TOKEN.REFRESH_TOKENS)
    protected readonly model: Model<RefreshTokenDocument>,
  ) {
    super(model);
  }
}
