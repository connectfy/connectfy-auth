import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { TokenRepository } from './repo/token.repo';
import { AddTokenDto } from './dto/add.token.dto';
import { RemoveTokenDto } from './dto/remove.token.dto';
import { TokenDocument } from './entity/token.entity';
import { BaseException } from '@common/exceptions/base.exception';
import { RemoveAllTokensDto } from './dto/remove.all.tokens.dto';
import { IRemoveAllResponse } from '@common/interfaces/response.interface';
import { FindTokenDto } from './dto/find.token.dto';
import { TOKEN_TYPE } from '@common/constants/common.enum';

@Injectable()
export class TokenService {
  constructor(private readonly repo: TokenRepository) {}

  async generateToken(data: AddTokenDto) {
    return await this.repo.save(data);
  }

  async findToken(option: FindTokenDto): Promise<TokenDocument> {
    const { _lang, ...options } = option;

    const token = await this.repo.findOne(options);

    if (!token)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    return token;
  }

  async findAllTokens(options: FindTokenDto): Promise<TokenDocument[]> {
    return await this.repo.findMany(options);
  }

  async removeToken(data: RemoveTokenDto): Promise<TokenDocument> {
    const { _id, _lang } = data;

    const res = await this.repo.remove({ _id });

    if (!res)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(_lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    return res;
  }

  async removeTokens({
    _ids,
  }: RemoveAllTokensDto): Promise<IRemoveAllResponse> {
    const allTokens = await this.repo.findMany({
      query: { _id: { $in: _ids } },
    });

    if (!allTokens.length)
      return { deletedCount: 0, notDeleted: [], deletedIds: [] };

    const removableIds = allTokens.map((token) => token._id);

    await this.repo.removeMany({ _id: { $in: removableIds } });

    return {
      deletedCount: removableIds.length,
      notDeleted: [],
      deletedIds: removableIds,
    };
  }

  async removeTokensByUserId(userId: string): Promise<IRemoveAllResponse> {
    const allTokens = await this.repo.findMany({
      query: {
        $and: [
          { userId: { $in: userId } },
          { type: { $ne: TOKEN_TYPE.RESTORE_ACCOUNT } },
        ],
      },
    });

    if (!allTokens.length)
      return { deletedCount: 0, notDeleted: [], deletedIds: [] };

    const removableIds = allTokens.map((token) => token._id);

    await this.repo.removeMany({ _id: { $in: removableIds } });

    return {
      deletedCount: removableIds.length,
      notDeleted: [],
      deletedIds: removableIds,
    };
  }
}
