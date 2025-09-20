import { Injectable } from '@nestjs/common';
import {
  IRefreshToken,
  IRefreshTokenPayload,
  IUpdateRefreshToken,
} from './interface/refresh-token.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDocument } from './entity/refresh-token.entity';
import { RefreshTokenRepository } from './repo/refresh-token.repo';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly repo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateTokens(payload: IRefreshTokenPayload): Promise<IRefreshToken> {
    const accessSecretKey = this.config.get<string>('JWT_ACCESS_SECRET');
    const accessExpiry = this.config.get<string>('ACCESS_EXPIRED');

    const refreshSecretKey = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiry = this.config.get<string>('REFRESH_EXPIRED');

    const access_token = await this.jwtService.signAsync(payload, {
      secret: accessSecretKey,
      expiresIn: accessExpiry,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: refreshSecretKey,
      expiresIn: refreshExpiry,
    });

    return { access_token, refresh_token };
  }

  async saveTokens(data: IUpdateRefreshToken): Promise<RefreshTokenDocument> {
    const { userId, refresh_token } = data;

    const findToken = await this.repo.findTokenByUserId(userId);

    if (findToken) return await this.repo.update({ userId, refresh_token });

    return await this.repo.save({ userId, refresh_token });
  }

  async findToken(refresh_token: string): Promise<RefreshTokenDocument | null> {
    return this.repo.findByRefreshToken(refresh_token);
  }

  async verifyToken(token: string, key: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: key,
    });
  }
}
