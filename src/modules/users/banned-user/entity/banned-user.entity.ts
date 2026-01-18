import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBannedUser } from '../interface/banned-user.interface';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { t } from 'i18next';
import { LANGUAGE } from 'connectfy-shared';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.USER.BANNED,
  toJSON: { virtuals: true, versionKey: false, getters: true },
  toObject: { virtuals: true, versionKey: false },
  autoIndex: process.env.NODE_ENV !== 'production',
  minimize: false,
  strict: true,
  strictQuery: true,
})
export class BannedUserModel implements IBannedUser {
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
    unique: true,
    index: true,
    immutable: true,
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
    type: Date,
    required: false,
    default: null,
    index: true,
    sparse: true,
  })
  bannedToDate: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const BannedUserSchema = SchemaFactory.createForClass(BannedUserModel);

// ================================================
// INDEXES - Performance optimization
// ================================================

// Timestamp indexes
BannedUserSchema.index({ createdAt: -1 });
BannedUserSchema.index({ updatedAt: -1 });

// Compound indexes (queries üçün)
BannedUserSchema.index({ userId: 1, bannedToDate: 1 });
BannedUserSchema.index({ bannedToDate: 1, createdAt: -1 });

export type BannedUserDocument = HydratedDocument<BannedUserModel>;
