import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeactivatedUser } from '../interface/deactivated-user.intreface';
import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { t } from 'i18next';
import { LANGUAGE, COLLECTIONS } from 'connectfy-shared';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.USER.DEACTIVATED,
  toJSON: { virtuals: true, versionKey: false, getters: true },
  toObject: { virtuals: true, versionKey: false },
  autoIndex: process.env.NODE_ENV !== 'production',
  minimize: false,
  strict: true,
  strictQuery: true,
})
export class DeactivatedUserModel implements IDeactivatedUser {
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

  createdAt: Date;
  updatedAt: Date;
}

export const DeactivatedUserSchema =
  SchemaFactory.createForClass(DeactivatedUserModel);

// ================================================
// INDEXES - Performance optimization
// ================================================

// Timestamp indexes (queries və analytics üçün)
DeactivatedUserSchema.index({ createdAt: -1 });
DeactivatedUserSchema.index({ updatedAt: -1 });

export type DeactivatedUserDocument = HydratedDocument<DeactivatedUserModel>;
