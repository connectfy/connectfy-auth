import {
  ExceptionMessages,
  ExceptionTypes,
} from '@common/constants/exception.constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { TokenRepository } from './repo/token.repo';
import { RemoveTokenDto } from './dto/remove.token.dto';
import { TokenDocument } from './entity/token.entity';
import { BaseException } from '@common/exceptions/base.exception';
import { RemoveAllTokensDto } from './dto/remove.all.tokens.dto';
import { IRemoveAllResponse } from '@common/interfaces/response.interface';
import { FindTokenDto } from './dto/find.token.dto';
import { LANGUAGE, TOKEN_TYPE } from '@common/constants/common.enum';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TokenService {
  constructor(
    private readonly repo: TokenRepository,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cls: ClsService,
  ) {}

  // async generateToken(data: AddTokenDto): Promise<IReturnedToken> {
  //   return (await this.repo.save(data)).toObject();
  // }

  hashToken(token: string): string {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    return hashedToken;
  }

  async generateAndSaveToken(
    userId: string,
    type: TOKEN_TYPE,
    expiresInMs: number,
  ): Promise<{ rawToken: string; hashedToken: string }> {
    const rawToken = crypto.randomBytes(128).toString('hex');
    const hashedToken = this.hashToken(rawToken);
    const tokenExpiry = new Date(Date.now() + expiresInMs);

    await this.repo.save({
      userId,
      token: hashedToken,
      type,
      expiresAt: tokenExpiry,
    });

    return { rawToken, hashedToken };
  }

  async generateAndSaveJwtToken(
    userId: string,
    type: TOKEN_TYPE,
    secret: string,
    jwtExp: string,
    tokenExp: number,
  ): Promise<string> {
    const token = this.jwtService.sign(
      { userId, type },
      {
        secret: this.config.get<string>(secret),
        expiresIn: jwtExp,
      },
    );

    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + tokenExp);

    await this.repo.save({
      userId,
      type,
      token: hashedToken,
      expiresAt,
    });

    return token;
  }

  async findToken(option: FindTokenDto): Promise<TokenDocument> {
    const lang = this.cls.get<LANGUAGE>('lang');

    const token = await this.repo.findOne(option);

    if (!token)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    return token;
  }

  async findAllTokens(options: FindTokenDto): Promise<TokenDocument[]> {
    return await this.repo.findMany(options);
  }

  async removeToken(data: RemoveTokenDto): Promise<TokenDocument> {
    const { _id } = data;
    const lang = this.cls.get<LANGUAGE>('lang');

    const res = await this.repo.remove({ _id });

    if (!res)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang),
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

  async removeMany(query: Record<string, any>): Promise<IRemoveAllResponse> {
    const allTokens = await this.repo.findMany({
      query,
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

  async remove(query: Record<string, any>) {
    const lang = this.cls.get<LANGUAGE>('lang');

    const res = await this.repo.remove(query);

    if (!res)
      throw new BaseException(
        ExceptionMessages.NOT_FOUND_MESSAGE(lang ?? LANGUAGE.EN),
        HttpStatus.NOT_FOUND,
        ExceptionTypes.NOT_FOUND,
      );

    return res;
  }
}
