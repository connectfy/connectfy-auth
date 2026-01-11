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
import { ENV, EXPIRE_DATES } from '@/src/common/constants/constants';

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
    const accessSecretKey = this.config.get<string>(ENV.AUTH.JWT.ACCESS.SECRET);
    const accessExpiry = this.config.get<string>(ENV.AUTH.JWT.ACCESS.EXPIRES_IN);

    const refreshSecretKey = this.config.get<string>(ENV.AUTH.JWT.REFRESH.SECRET);
    const refreshExpiry = this.config.get<string>(ENV.AUTH.JWT.REFRESH.EXPIRES_IN);

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
      $and: [{ userId }, { deviceId }],
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
      expiresAt: new Date(Date.now() + EXPIRE_DATES.TOKEN.ONE_MONTH),
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
    ignoreExpiration: boolean = true
  ): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: isAccessToken
        ? this.config.get<string>(ENV.AUTH.JWT.ACCESS.SECRET)
        : this.config.get<string>(ENV.AUTH.JWT.REFRESH.SECRET),
      ignoreExpiration
    });
  }

  async removeTokenByUserId(
    userId: string,
  ): Promise<RefreshTokenDocument | null> {
    return await this.repo.remove({ userId });
  }
}
