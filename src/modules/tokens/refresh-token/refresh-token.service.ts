import { Injectable } from '@nestjs/common';
import {
  IGenerateRefreshToken,
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

  async generateTokens(
    payload: IRefreshTokenPayload,
  ): Promise<IGenerateRefreshToken> {
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
    const { userId, deviceId, refresh_token } = data;

    const findToken = await this.repo.findOne({
      $and: [{ userId }, { deviceId }, { refresh_token }],
    });

    if (findToken) return await this.repo.update(data);

    return await this.repo.save(data);
  }

  async findToken(refresh_token: string): Promise<RefreshTokenDocument | null> {
    return this.repo.findByRefreshToken(refresh_token);
  }

  async verifyToken(
    token: string,
    isAccessToken: boolean = true,
  ): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: isAccessToken
        ? this.config.get<string>('JWT_ACCESS_SECRET')
        : this.config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async removeTokenByUserId(
    userId: string,
  ): Promise<RefreshTokenDocument | null> {
    return await this.repo.remove({ userId });
  }
}
