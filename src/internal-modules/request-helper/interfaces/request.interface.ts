import { BROWSER_TYPE, DEVICE_TYPE, OS_TYPE } from 'connectfy-shared';

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
  country: string | null; // "Azerbaijan"
  countryCode: string | null; // "AZ"
  city: string | null; // null (geoip-lite doesn't provide)
  region: string | null; // "04" or region name
  timezone: string | null; // "Asia/Baku"
  latitude: number | null; // 40.4093
  longitude: number | null; // 49.8671
}

export interface IDeviceInfoWithLocation extends IDeviceInfo, IGeoLocation {}

export interface IRequestData {
  headers: {
    'user-agent': string;
    'x-forwarded-for': string;
    'x-real-ip': string;
    'cf-connecting-ip': string;
  };
  ip: string;
}
