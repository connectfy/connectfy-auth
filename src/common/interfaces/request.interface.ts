import { IUser } from '@/src/modules/users/user/interface/user.interface';
import {
  BROWSER_TYPE,
  DATE_FORMAT,
  DEVICE_TYPE,
  GENDER,
  LANGUAGE,
  NOTIFICATION_CONTENT_MODE,
  NOTIFICATION_SOUND_MODE,
  OS_TYPE,
  PRIVACY_SETTINGS_CHOICE,
  STARTUP_PAGE,
  THEME,
  TIME_FORMAT,
} from '../enums/enums';

export interface ILoggedUser {
  user: IUser;
  account: IAccount;
  settings: {
    generalSettings: IGeneralSettings;
    notificationSettings: INotificationSettings;
    privacySettings: IPrivacySettings;
  };
}

export interface IAccount {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender: GENDER;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  lastSeen: Date;
  birthdayDate: Date;
}

export interface IGeneralSettings {
  _id: string;
  userId: string;
  theme: THEME;
  language: LANGUAGE;
  startupPage: STARTUP_PAGE;
  timeZone: ITimeZone;
}

export interface INotificationSettings {
  _id: string;
  userId: string;
  notificationSoundMode: NOTIFICATION_SOUND_MODE;
  notificationContentMode: NOTIFICATION_CONTENT_MODE;
  sendMessageSound: boolean;
  receiveMessageSound: boolean;
  notificationSound: boolean;
  privateMessageSound: boolean;
  groupMessageSound: boolean;
  systemNotificationSound: boolean;
  friendshipNotificationSound: boolean;
  showPrivateMessageNotification: boolean;
  showGroupMessageNotification: boolean;
  showFriendshipNotification: boolean;
  showSystemNotification: boolean;
}

export interface IPrivacySettings {
  _id: string;
  userId: string;
  email: PRIVACY_SETTINGS_CHOICE;
  bio: PRIVACY_SETTINGS_CHOICE;
  gender: PRIVACY_SETTINGS_CHOICE;
  location: PRIVACY_SETTINGS_CHOICE;
  socialLinks: PRIVACY_SETTINGS_CHOICE;
  lastSeen: PRIVACY_SETTINGS_CHOICE;
  avatar: PRIVACY_SETTINGS_CHOICE;
  messageRequest: PRIVACY_SETTINGS_CHOICE;
  birthdayDate: PRIVACY_SETTINGS_CHOICE;
  friendshipRequest: boolean;
  readReceipts: boolean;
}

export interface ITimeZone {
  timeFormat: TIME_FORMAT;
  dateFormat: DATE_FORMAT;
}

export interface IParsedUserAgent {
  browser: BROWSER_TYPE;
  browserVersion: string | null;
  os: OS_TYPE;
  osVersion: string | null;
  platform: DEVICE_TYPE;
}

export interface IDeviceInfo {
  userAgent: string;
  browser: BROWSER_TYPE;
  browserVersion: string | null;
  os: OS_TYPE;
  osVersion: string | null;
  platform: DEVICE_TYPE;
  ipAddress: string;
  deviceName: string;
}

export interface IGeoLocation {
  country: string | null;        // "Azerbaijan"
  countryCode: string | null;    // "AZ"
  city: string | null;           // null (geoip-lite doesn't provide)
  region: string | null;         // "04" or region name
  timezone: string | null;       // "Asia/Baku"
  latitude: number | null;       // 40.4093
  longitude: number | null;      // 49.8671
}

export interface IDeviceInfoWithLocation extends IDeviceInfo, IGeoLocation {}
