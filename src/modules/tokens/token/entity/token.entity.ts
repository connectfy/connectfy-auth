import { v4 as uuid, validate } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { IToken } from '../interface/token.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TOKEN_TYPE, LANGUAGE, COLLECTIONS } from 'connectfy-shared';
import { t } from 'i18next';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.TOKEN.TOKENS,
  toJSON: { virtuals: true, versionKey: false, getters: true },
  toObject: { virtuals: true, versionKey: false },
  autoIndex: process.env.NODE_ENV !== 'production',
  minimize: false,
  strict: true,
  strictQuery: true,
})
export class TokenModel implements IToken {
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
        field: 'token',
      }),
    ],
    unique: true,
    index: true,
    // select: false, // Security: default query-lərdə token gəlməsin
  })
  token: string;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'type',
      }),
    ],
    enum: {
      values: Object.values(TOKEN_TYPE),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'type',
        values: Object.values(TOKEN_TYPE),
      }),
    },
    default: TOKEN_TYPE.PASSWORD_RESET,
    index: true,
  })
  type: TOKEN_TYPE;

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
        field: 'isUsed',
      }),
    ],
    default: false,
    index: true,
  })
  isUsed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);

// ================================================
// INDEXES - Performance optimization
// ================================================

// Compound indexes (tez-tez query olunan kombinasiyalar)
TokenSchema.index({ userId: 1, type: 1 });
TokenSchema.index({ userId: 1, isUsed: 1 });
TokenSchema.index({ token: 1, type: 1 });
TokenSchema.index({ type: 1, isUsed: 1 });
TokenSchema.index({ expiresAt: 1, isUsed: 1 });

TokenSchema.index({ createdAt: -1 });
TokenSchema.index({ updatedAt: -1 });

// Compound index for cleanup queries
TokenSchema.index({ isUsed: 1, expiresAt: 1 });

export type TokenDocument = HydratedDocument<TokenModel>;
