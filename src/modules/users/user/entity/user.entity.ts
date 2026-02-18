import { v4 as uuid } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../interface/user.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  PhoneNumberModel,
  PhoneNumberSchema,
} from './nested/phoneNumber.entity';
import { t } from 'i18next';
import {
  LANGUAGE,
  COLLECTIONS,
  PROVIDER,
  ROLE,
  USER_STATUS,
} from 'connectfy-shared';
import * as bcrypt from 'bcrypt';

@Schema({
  timestamps: true,
  collection: COLLECTIONS.AUTH.USER.USERS,
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
export class UserModel implements IUser {
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
        field: 'username',
      }),
    ],
    unique: true,
    minlength: [
      3,
      t('validation_messages.min_length', {
        lng: LANGUAGE.EN,
        field: 'username',
        length: 3,
      }),
    ],
    maxlength: [
      30,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'username',
        length: 30,
      }),
    ],
    trim: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function (value: string): boolean {
        return /^[a-zA-Z0-9_-]+$/.test(value);
      },
      message: t('validation_messages.invalid_username', {
        lng: LANGUAGE.EN,
      }),
    },
  })
  username: string;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'email',
      }),
    ],
    unique: true,
    maxlength: [
      254,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'email',
        length: 254,
      }),
    ],
    trim: true,
    lowercase: true,
    index: true,
    validate: {
      validator: function (value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: t('validation_messages.invalid_email', {
        lng: LANGUAGE.EN,
      }),
    },
  })
  email: string;

  @Prop({
    type: String,
    enum: {
      values: Object.values(ROLE),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'role',
        values: Object.values(ROLE),
      }),
    },
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'role',
      }),
    ],
    default: ROLE.USER,
    index: true,
  })
  role: ROLE;

  @Prop({
    type: String,
    enum: {
      values: Object.values(PROVIDER),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'provider',
        values: Object.values(PROVIDER),
      }),
    },
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'provider',
      }),
    ],
    default: PROVIDER.PASSWORD,
    index: true,
  })
  provider: PROVIDER;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'password',
      }),
    ],
    maxlength: [
      100,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'password',
        length: 100,
      }),
    ],
    select: false,
  })
  password: string;

  @Prop({
    type: PhoneNumberSchema,
    required: false,
    default: null,
  })
  phoneNumber: PhoneNumberModel | null;

  @Prop({
    type: String,
    required: [
      true,
      t('validation_messages.required', {
        lng: LANGUAGE.EN,
        field: 'status',
      }),
    ],
    enum: {
      values: Object.values(USER_STATUS),
      message: t('validation_messages.enum', {
        lng: LANGUAGE.EN,
        field: 'status',
        values: Object.values(USER_STATUS),
      }),
    },
    default: USER_STATUS.ACTIVE,
    index: true,
  })
  status: USER_STATUS;

  @Prop({
    type: String,
    required: false,
    default: null,
    trim: true,
    maxlength: [
      100,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'timeZone',
        length: 100,
      }),
    ],
  })
  timeZone: string | null;

  @Prop({
    type: String,
    required: false,
    default: null,
    trim: true,
    maxlength: [
      100,
      t('validation_messages.max_length', {
        lng: LANGUAGE.EN,
        field: 'location',
        length: 100,
      }),
    ],
  })
  location: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// ================================================
// INDEXES - Performance optimization
// ================================================

// Compound indexes
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ username: 1, status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ provider: 1, status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ updatedAt: -1 });

// Text search index
UserSchema.index({ username: 'text', email: 'text' });

// Sparse indexes (null dəyərləri skip edir)
UserSchema.index({ 'phoneNumber.number': 1 }, { sparse: true });

// ================================================
// VIRTUAL FIELDS - Calculated properties
// ================================================

// Full identifier (username or email)
UserSchema.virtual('identifier').get(function () {
  return this.username || this.email;
});

// Is active user
UserSchema.virtual('isActive').get(function () {
  return this.status === USER_STATUS.ACTIVE;
});

// Is banned user
UserSchema.virtual('isBanned').get(function () {
  return this.status === USER_STATUS.BANNED;
});

// Is suspended user
UserSchema.virtual('isInactive').get(function () {
  return this.status === USER_STATUS.INACTIVE;
});

// Is deleted user
UserSchema.virtual('isDeleted').get(function () {
  return this.status === USER_STATUS.DELETED;
});

// Is admin
UserSchema.virtual('isAdmin').get(function () {
  return this.role === ROLE.ADMIN;
});

// Is moderator
UserSchema.virtual('isModerator').get(function () {
  return this.role === ROLE.MODERATOR;
});

// Is regular user
UserSchema.virtual('isUser').get(function () {
  return this.role === ROLE.USER;
});

// Uses password authentication
UserSchema.virtual('usesPasswordAuth').get(function () {
  return this.provider === PROVIDER.PASSWORD;
});

// Uses OAuth authentication
UserSchema.virtual('usesOAuth').get(function () {
  return (
    this.provider === PROVIDER.GOOGLE || this.provider === PROVIDER.FACEBOOK
  );
});

// Has phone number
UserSchema.virtual('hasPhoneNumber').get(function () {
  return !!this.phoneNumber?.number;
});

// Account age in days
UserSchema.virtual('accountAgeInDays').get(function () {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ================================================
// METHODS - Instance methods
// ================================================

// Compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    return false;
  }
};

// Activate account
UserSchema.methods.activate = function () {
  this.status = USER_STATUS.ACTIVE;
  return this.save();
};

// Ban account
UserSchema.methods.ban = function () {
  this.status = USER_STATUS.BANNED;
  return this.save();
};

// Suspend account
UserSchema.methods.inactive = function () {
  this.status = USER_STATUS.INACTIVE;
  return this.save();
};

// Soft delete account
UserSchema.methods.softDelete = function () {
  this.status = USER_STATUS.DELETED;
  return this.save();
};

// ================================================
// MIDDLEWARE / HOOKS
// ================================================

// Pre-save hook - Password hashing
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  // Username və email lowercase
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  next();
});

export type UserDocument = HydratedDocument<UserModel>;
