import { DEVICE_TYPE } from '@/src/common/enums/enums';

export interface IRefreshToken {
  _id: string;
  userId: string;
  refresh_token: string;

  deviceId: string | null;
  userAgent: string | null;
  deviceName: string | null;
  platform: DEVICE_TYPE;
  browser: string | null;
  os: string | null;

  ipAddress: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  longitude: number | null;
  latitude: number | null;
  region: string | null;
  timezone: string | null;

  // Security
  lastUsedAt: Date;
  expiresAt: Date;
  isActive: boolean;

  // Metadata
  metadata: Record<string, any> | null;
}

export interface IGenerateRefreshToken {
  access_token?: string;
  refresh_token: string;
}

export interface IRefreshTokenPayload {
  [key: string]: string | number;
}

export interface ISaveRefreshToken {
  userId: string;
  refresh_token: string;
  deviceId?: string | null;
  userAgent?: string | null;
  deviceName?: string | null;
  platform?: string | null;
  browser?: string | null;
  os?: string | null;
  ipAddress?: string | null;
  country?: string | null;
  countryCode?: string | null;
  city?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  region?: string | null;
  timezone?: string | null;
  expiresAt?: Date;
}

export interface IUpdateRefreshToken extends ISaveRefreshToken {}
