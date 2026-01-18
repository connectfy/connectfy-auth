import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IRefreshToken } from '../interface/refresh-token.interface';
import { DEVICE_TYPE } from '@/src/common/enums/enums';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { t } from 'i18next';
import { LANGUAGE } from 'connectfy-shared';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.TOKEN.REFRESH_TOKENS,
  toJSON: {
    virtuals: true,
    versionKey: false,
    getters: true,
  },
  toObject: {
    virtuals: true,
    versionKey: false,
  },
  autoIndex: process.env.NODE_ENV !== 'production',
  minimize: false,
  strict: true,
  strictQuery: true,
})
export class RefreshTokenModel implements IRefreshToken {
  @Prop({
    type: String,
    default: () => uuid(),
    immutable: true,
  })
  _id: string;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'userId',
      }),
    ],
    index: true,
    ref: COLLECTIONS.AUTH.USER.USERS,
    validate: {
      validator: function (value: string | null): boolean {
        return !!(value && validate(value));
      },
      message: t('validation_messages.uuid', {
        lng: LANGUAGE.EN,
        field: 'userId',
      }),
    },
  })
  userId: string;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'refresh_token',
      }),
    ],
    unique: true,
    index: true,
    select: false, // Security: default query-lərdə gəlməsin
  })
  refresh_token: string;

  // ============================================
  // DEVICE & SESSION IDENTIFICATION
  // ============================================

  @Prop({
    type: String,
    required: false,
    default: null,
    index: true,
    trim: true,
  })
  deviceId: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [
      500,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'userAgent',
        length: 500,
      }),
    ],
    trim: true,
  })
  userAgent: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [
      100,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'deviceName',
        length: 100,
      }),
    ],
    trim: true,
  })
  deviceName: string | null;

  @Prop({
    type: String,
    enum: {
      values: Object.values(DEVICE_TYPE),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'platform',
        values: Object.values(DEVICE_TYPE),
      }),
    },
    default: DEVICE_TYPE.UNKNOWN,
    index: true,
  })
  platform: DEVICE_TYPE;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [50, 'Browser name too long'],
    trim: true,
  })
  browser: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [50, 'OS name too long'],
    trim: true,
  })
  os: string | null;

  // ============================================
  // NETWORK & LOCATION
  // ============================================

  @Prop({
    type: String,
    required: false,
    default: null,
    index: true,
    trim: true,
    validate: {
      validator: function (value: string | null): boolean {
        if (!value) return true;
        // IPv4 və IPv6 validation
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
        return ipv4Regex.test(value) || ipv6Regex.test(value);
      },
      message: 'Invalid IP address format',
    },
  })
  ipAddress: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [100, 'Country name too long'],
    trim: true,
    index: true,
  })
  country: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [3, 'Country code too long'],
    uppercase: true,
    trim: true,
  })
  countryCode: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [100, 'City name too long'],
    trim: true,
  })
  city: string | null;

  @Prop({
    type: Number,
    required: false,
    default: null,
    min: [-180, 'Longitude must be >= -180'],
    max: [180, 'Longitude must be <= 180'],
  })
  longitude: number | null;

  @Prop({
    type: Number,
    required: false,
    default: null,
    min: [-90, 'Latitude must be >= -90'],
    max: [90, 'Latitude must be <= 90'],
  })
  latitude: number | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [100, 'Region name too long'],
    trim: true,
  })
  region: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [50, 'Timezone too long'],
    trim: true,
  })
  timezone: string | null;

  // ============================================
  // SECURITY & TRACKING
  // ============================================

  @Prop({
    type: Date,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'lastUsedAt',
      }),
    ],
    default: Date.now,
    index: true,
  })
  lastUsedAt: Date;

  @Prop({
    type: Date,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'expiresAt',
      }),
    ],
    index: true,
  })
  expiresAt: Date;

  @Prop({
    type: Boolean,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'isActive',
      }),
    ],
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    type: String,
    required: false,
    default: null,
    select: false,
  })
  fingerprint: string | null;

  // ============================================
  // METADATA
  // ============================================

  @Prop({
    type: Object,
    required: false,
    default: null,
  })
  metadata: Record<string, any> | null;

  createdAt: Date;
  updatedAt: Date;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenModel);

// ================================================
// INDEXES - Performance optimization
// ================================================

// Unique index
RefreshTokenSchema.index({ refresh_token: 1 }, { unique: true });

// Compound indexes (tez-tez query olunan kombinasiyalar)
RefreshTokenSchema.index({ userId: 1, isActive: 1 });
RefreshTokenSchema.index({ userId: 1, deviceId: 1 });
RefreshTokenSchema.index({ userId: 1, platform: 1 });
// ================================================
// MIDDLEWARE / HOOKS
// ================================================

// Pre-update hook
RefreshTokenSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  // expiresAt validation
  if (update.$set?.expiresAt && update.$set.expiresAt < new Date()) {
    return next(new Error('expiresAt cannot be in the past'));
  }

  // Token istifadə ediləndə lastUsedAt yenilə
  if (update.$set && !update.$set.lastUsedAt) {
    update.$set.lastUsedAt = new Date();
  }

  this.set({ updatedAt: new Date() });
  next();
});

export type RefreshTokenDocument = HydratedDocument<RefreshTokenModel>;
