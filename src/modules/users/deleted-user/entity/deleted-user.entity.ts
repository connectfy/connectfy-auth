import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeletedUser } from '../interface/deleted-user.interface';
import { DELETE_REASON } from '@/src/common/enums/enums';
import { COLLECTIONS } from '@/src/common/constants/constants';
import { t } from 'i18next';
import { LANGUAGE } from 'connectfy-shared';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.USER.DELETED,
  toJSON: { virtuals: true, versionKey: false, getters: true },
  toObject: { virtuals: true, versionKey: false },
  autoIndex: process.env.NODE_ENV !== 'production',
  minimize: false,
  strict: true,
  strictQuery: true,
})
export class DeletedUserModel implements IDeletedUser {
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
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'deletedAt',
      }),
    ],
    default: Date.now,
    index: true,
    immutable: true,
  })
  deletedAt: Date;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'reason',
      }),
    ],
    enum: {
      values: Object.values(DELETE_REASON),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'reason',
        values: Object.values(DELETE_REASON),
      }),
    },
    index: true,
  })
  reason: DELETE_REASON;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [
      500,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'otherReason',
        length: 500,
      }),
    ],
    trim: true,
  })
  otherReason: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const DeletedUserSchema = SchemaFactory.createForClass(DeletedUserModel);

// ================================================
// INDEXES - Performance optimization
// ================================================
DeletedUserSchema.index({ createdAt: -1 });

// ================================================
// VIRTUAL FIELDS - Calculated properties
// ================================================

// Days since deletion
DeletedUserSchema.virtual('daysSinceDeletion').get(function () {
  if (!this.deletedAt) return 0;
  const now = new Date();
  const deleted = new Date(this.deletedAt);
  const diffTime = Math.abs(now.getTime() - deleted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export type DeletedUserDocument = HydratedDocument<DeletedUserModel>;
