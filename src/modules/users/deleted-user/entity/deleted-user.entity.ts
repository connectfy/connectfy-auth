import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeletedUser } from '../interface/deleted-user.interface';
import {
  DELETE_REASON,
  LANGUAGE,
  COLLECTIONS,
  DELETE_REASON_CODE,
} from 'connectfy-shared';
import { t } from 'i18next';

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
    immutable: true,
  })
  reason: DELETE_REASON;

  @Prop({
    type: String,
    enum: DELETE_REASON_CODE,
    required: false,
    default: null,
    validate: {
      validator: function (
        this: DeletedUserModel,
        value: DELETE_REASON_CODE | null,
      ): boolean {
        if (this.reason === DELETE_REASON.USER_REQUEST) {
          return !!(value && Object.values(DELETE_REASON_CODE).includes(value));
        }
        return true;
      },
      message: t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'reasonCode',
      }),
    },
    trim: true,
    immutable: true,
  })
  reasonCode: DELETE_REASON_CODE | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    maxlength: [
      200,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'reasonDescription',
        length: 200,
      }),
    ],
    trim: true,
    immutable: true,
  })
  reasonDescription: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const DeletedUserSchema = SchemaFactory.createForClass(DeletedUserModel);

// ================================================
// INDEXES - Performance optimization
// ================================================
DeletedUserSchema.index({ createdAt: -1 });

export type DeletedUserDocument = HydratedDocument<DeletedUserModel>;
