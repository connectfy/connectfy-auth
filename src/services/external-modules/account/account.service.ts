import { Inject, Injectable } from '@nestjs/common';
import { MICROSERVICE_NAMES } from '@common/constants/constants';
import { ClientProxy } from '@nestjs/microservices';
import { GENDER } from 'connectfy-shared';
import { sendWithContext } from '@common/helpers/microservice-request.helper';

@Injectable()
export class AccountService {
  constructor(
    @Inject(MICROSERVICE_NAMES.ACCOUNT.TCP)
    private readonly accountServiceTcp: ClientProxy,
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
    _lang: string;
    birthdayDate: Date | null;
    theme: string | null;
    location: string | null;
  }): Promise<void> {
    const {
      userId,
      firstName = '',
      lastName = '',
      username,
      gender,
      avatar,
      _lang,
      birthdayDate,
      theme,
    } = opts;

    await Promise.all([
      // account create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'account/create',
        payload: {
          userId,
          firstName,
          lastName,
          username,
          gender,
          avatar,
          _lang,
          birthdayDate,
        },
      }),

      // privacy settings create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'privacy-settings/create',
        payload: { userId, _lang },
      }),

      // general settings create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'general-settings/create',
        payload: { userId, _lang, theme, language: _lang },
      }),

      // notification settings create
      sendWithContext({
        client: this.accountServiceTcp,
        endpoint: 'notification-settings/create',
        payload: { userId, _lang },
      }),
    ]);
  }

  // =================================
  // FIND USER ACCOUNT
  // =================================
  async findAccount(payload: Record<string, any>): Promise<any> {
    return await sendWithContext({
      client: this.accountServiceTcp,
      endpoint: 'account/findOne',
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
