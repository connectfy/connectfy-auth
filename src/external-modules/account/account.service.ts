import { TcpConnectionService } from '@/src/app-settings/tcp-connections/tcp-connection.service';
import { Injectable } from '@nestjs/common';
import { GENDER, LANGUAGE, CLS_KEYS, BaseFindDto } from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AccountService {
  constructor(
    private readonly tcpConnectionService: TcpConnectionService,
    private readonly cls: ClsService,
  ) {}

  // =================================
  // CREATE USER PROFILE AND SETTINGS
  // =================================
  async createAccountRelatedServices(opts: {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    gender: GENDER;
    avatar?: string | null;
    birthdayDate: Date | null;
    theme: string | null;
    location: string | null;
  }): Promise<void> {
    const language = this.cls.get<LANGUAGE>(CLS_KEYS.LANG);
    const {
      userId,
      firstName = '',
      lastName = '',
      username,
      gender,
      avatar,
      birthdayDate,
      theme,
    } = opts;

    await Promise.all([
      // account create
      this.tcpConnectionService.account({
        endpoint: 'profile/create',
        payload: {
          userId,
          firstName,
          lastName,
          username,
          gender,
          avatar,
          birthdayDate,
        },
      }),

      // privacy settings create
      this.tcpConnectionService.account({
        endpoint: 'privacy-settings/create',
        payload: { userId },
      }),

      // general settings create
      this.tcpConnectionService.account({
        endpoint: 'general-settings/create',
        payload: { userId, theme, language },
      }),

      // notification settings create
      this.tcpConnectionService.account({
        endpoint: 'notification-settings/create',
        payload: { userId },
      }),
    ]);
  }

  // =================================
  // FIND USER PROFILE
  // =================================
  async findProfile(payload: BaseFindDto): Promise<any> {
    return await this.tcpConnectionService.account({
      endpoint: 'profile/findOne',
      payload,
    });
  }

  // =================================
  // FIND GENERAL SETTINGS
  // =================================
  async findGeneralSettings(payload: BaseFindDto): Promise<any> {
    return await this.tcpConnectionService.account({
      endpoint: 'general-settings/findOne',
      payload,
    });
  }

  // =================================
  // FIND NOTIFICATION SETTINGS
  // =================================
  async findNotificationSettings(payload: BaseFindDto): Promise<any> {
    return await this.tcpConnectionService.account({
      endpoint: 'notification-settings/findOne',
      payload,
    });
  }

  // =================================
  // FIND PRIVACY SETTINGS
  // =================================
  async findPrivacySettings(payload: BaseFindDto): Promise<any> {
    return await this.tcpConnectionService.account({
      endpoint: 'privacy-settings/findOne',
      payload,
    });
  }
}
