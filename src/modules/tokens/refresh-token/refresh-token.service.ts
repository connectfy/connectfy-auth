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
import { RequestHelper } from '@/src/common/helpers/request.helper';

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

  async saveTokens(data: {
    userId: string;
    deviceId: string;
    refresh_token: string;
    requestData: Record<string, any>;
  }): Promise<RefreshTokenDocument> {
    const { userId, deviceId, refresh_token, requestData } = data;

    const findToken = await this.repo.findOne({
      $and: [{ userId }, { deviceId }, { refresh_token }],
    });

    const deviceInfo =
      RequestHelper.parseDeviceInfoFromRequestData(requestData);

    const finalData: IUpdateRefreshToken = {
      userId,
      refresh_token,
      deviceId,
      deviceName: deviceInfo.deviceName,
      userAgent: deviceInfo.userAgent,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      platform: deviceInfo.platform,
      ipAddress: deviceInfo.ipAddress,
      country: deviceInfo.country,
      countryCode: deviceInfo.countryCode,
      city: deviceInfo.city,
      region: deviceInfo.region,
      longitude: deviceInfo.longitude,
      latitude: deviceInfo.latitude,
      timezone: deviceInfo.timezone,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    if (findToken) return await this.repo.update(finalData);

    return await this.repo.save(finalData);
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
