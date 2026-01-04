import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import * as geoip from 'geoip-lite';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IRefreshToken } from '../interface/refresh-token.interface';
import { DEVICE_TYPE } from '@/src/common/constants/common.enum';

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshTokenModel implements IRefreshToken {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: String, required: true })
  refresh_token: string;

  // ============================================
  // DEVICE & SESSION IDENTIFICATION
  // ============================================

  @Prop({ type: String, required: false, default: null })
  deviceId: string | null;

  @Prop({ type: String, required: false, default: null })
  userAgent: string | null;

  @Prop({ type: String, required: false, default: null })
  deviceName: string | null;

  @Prop({
    type: String,
    enum: DEVICE_TYPE,
    default: DEVICE_TYPE.UNKNOWN,
  })
  platform: DEVICE_TYPE;

  @Prop({ type: String, required: false, default: null })
  browser: string | null;

  @Prop({ type: String, required: false, default: null })
  os: string | null;

  // ============================================
  // NETWORK & LOCATION
  // ============================================

  @Prop({ type: String, required: false, default: null })
  ipAddress: string | null;

  @Prop({ type: String, required: false, default: null })
  country: string | null;
  
  @Prop({ type: String, required: false, default: null })
  countryCode: string | null;

  @Prop({ type: String, required: false, default: null })
  city: string | null;

  @Prop({ type: Number, required: false, default: null })
  longitude: number | null;

  @Prop({ type: Number, required: false, default: null })
  latitude: number | null;

  @Prop({ type: String, required: false, default: null })
  region: string | null;

  @Prop({ type: String, required: false, default: null })
  timezone: string | null;

  // ============================================
  // SECURITY & TRACKING
  // ============================================

  @Prop({ type: Date, required: true, default: Date.now })
  lastUsedAt: Date;

  @Prop({ type: Date, required: false, default: null })
  expiresAt: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, required: false, default: null })
  fingerprint?: string;

  // ============================================
  // METADATA
  // ============================================

  @Prop({ type: Object, required: false, default: null })
  metadata: Record<string, any> | null;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenModel);

// ============================================
// INDEXES FOR PERFORMANCE
// ============================================
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ refresh_token: 1 });
RefreshTokenSchema.index({ deviceId: 1 });
RefreshTokenSchema.index({ isActive: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });

export type RefreshTokenDocument = RefreshTokenModel & Document;
