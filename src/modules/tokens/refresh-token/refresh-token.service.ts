import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IGenerateRefreshToken,
  IRefreshTokenPayload,
  IReturnedRefreshToken,
  IUpdateRefreshToken,
} from './interface/refresh-token.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from './repo/refresh-token.repo';
import { RequestHelperService } from '@/src/internal-modules/request-helper/request-helper.service';
import {
  ExceptionMessages,
  LANGUAGE,
  ENV,
  EXPIRE_DATES,
  BaseException,
  CLS_KEYS,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';
import { IRequestData } from '@/src/internal-modules/request-helper/interfaces/request.interface';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly repo: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly cls: ClsService,
    private readonly requestHelperService: RequestHelperService,
  ) {}

  async generateTokens(
    payload: IRefreshTokenPayload,
  ): Promise<IGenerateRefreshToken> {
    const accessSecretKey = this.config.get<string>(ENV.AUTH.JWT.ACCESS.SECRET);
    const accessExpiry = this.config.get<string>(
      ENV.AUTH.JWT.ACCESS.EXPIRES_IN,
    );

    const refreshSecretKey = this.config.get<string>(
      ENV.AUTH.JWT.REFRESH.SECRET,
    );
    const refreshExpiry = this.config.get<string>(
      ENV.AUTH.JWT.REFRESH.EXPIRES_IN,
    );

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
    requestData: IRequestData;
  }): Promise<IReturnedRefreshToken> {
    const { userId, deviceId, refresh_token, requestData } = data;

    const findToken = await this.repo.findOne({
      query: {
        $and: [{ userId }, { deviceId }],
      },
    });

    const deviceInfo =
      this.requestHelperService.parseDeviceInfoFromRequestData(requestData);

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

    if (findToken) {
      return await this.repo.update({ _id: findToken._id }, finalData);
    }

    return await this.repo.create(finalData);
  }

  async verifyToken(
    token: string,
    isAccessToken: boolean = true,
    ignoreExpiration: boolean = true,
  ): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: isAccessToken
        ? this.config.get<string>(ENV.AUTH.JWT.ACCESS.SECRET)
        : this.config.get<string>(ENV.AUTH.JWT.REFRESH.SECRET),
      ignoreExpiration,
    });
  }

  async removeTokenByUserId(
    userId: string,
  ): Promise<IReturnedRefreshToken | null> {
    return await this.repo.removeOne({ userId });
  }

  async findToken(refreshToken: string): Promise<IReturnedRefreshToken> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const res = await this.repo.findOne({ query: { refreshToken } });

    if (!res)
      throw new BaseException(
        ExceptionMessages.UNAUTHORIZED_MESSAGE(language),
        HttpStatus.UNAUTHORIZED,
        { navigate: true },
      );

    return res;
  }
}
