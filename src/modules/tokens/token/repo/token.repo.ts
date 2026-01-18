import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddTokenDto } from '../dto/add.token.dto';
import { UpdateTokenDto } from '../dto/edit.token.dto';
import { TokenDocument } from '../entity/token.entity';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { BaseRepository } from '@common/repo/base.repository';
import { IReturnedToken } from '@modules/tokens/token/interface/token.interface';

export class TokenRepository extends BaseRepository<
  TokenDocument,
  IReturnedToken,
  AddTokenDto,
  UpdateTokenDto
> {
  constructor(
    @InjectModel(COLLECTIONS.AUTH.TOKEN.TOKENS)
    protected readonly model: Model<TokenDocument>,
  ) {
    super(model);
  }
}
