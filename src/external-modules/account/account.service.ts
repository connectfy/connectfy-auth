import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  sendWithContext,
  MICROSERVICE_NAMES,
  GENDER,
  LANGUAGE,
  CLS_KEYS,
} from 'connectfy-shared';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AccountService {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly accountServiceTcp: ClientProxy,
    private readonly cls: ClsService,
  ) {}

  // =================================
  // CREATE USER ACCOUNT AND SETTINGS
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
      sendWithContext({
        client: this.accountServiceTcp,
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
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'privacy-settings/create',
        payload: { userId },
      }),

      // general settings create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'general-settings/create',
        payload: { userId, theme, language },
      }),

      // notification settings create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'notification-settings/create',
        payload: { userId },
      }),
    ]);
  }

  // =================================
  // FIND USER ACCOUNT
  // =================================
  async findAccount(payload: Record<string, any>): Promise<any> {
    return await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'profile/findOne',
      payload,
    });
  }

  // =================================
  // FIND GENERAL SETTINGS
  // =================================
  async findGeneralSettings(payload): Promise<any> {
    return await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'general-settings/findOne',
      payload,
    });
  }

  // =================================
  // FIND NOTIFICATION SETTINGS
  // =================================
  async findNotificationSettings(payload): Promise<any> {
    return await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'notification-settings/findOne',
      payload,
    });
  }

  // =================================
  // FIND PRIVACY SETTINGS
  // =================================
  async findPrivacySettings(payload): Promise<any> {
    return await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'privacy-settings/findOne',
      payload,
    });
  }
}
