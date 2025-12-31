import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { IUser } from '../interface/user.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PROVIDER, ROLE, USER_STATUS } from '@common/constants/common.enum';
import {
  PhoneNumberModel,
  PhoneNumberSchema,
} from './nested/phoneNumber.entity';
import { ITimestamps } from '@common/interfaces/date.interface';

@Schema({ timestamps: true, collection: 'users' })
export class UserModel implements IUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ 
    type: String, 
    required: true,
    minlength: 3,
    maxlength: 30,
    trim: true,
  })
  username: string;

  @Prop({ 
    type: String, 
    required: true,
    maxlength: 254,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ 
    type: String, 
    enum: ROLE, 
    required: true, 
    default: ROLE.USER 
  })
  role: ROLE;

  @Prop({
    type: String,
    enum: PROVIDER,
    required: true,
    default: PROVIDER.PASSWORD,
  })
  provider: PROVIDER;

  @Prop({ 
    type: String, 
    required: true,
    maxlength: 100,
  })
  password: string;

  @Prop({ 
    type: PhoneNumberSchema, 
    required: false, 
    default: null 
  })
  phoneNumber: PhoneNumberModel;

  @Prop({ 
    type: String, 
    required: false, 
    default: null,
    maxlength: 20000,
  })
  faceDescriptor: string | null;

  @Prop({ 
    type: String, 
    required: true, 
    enum: USER_STATUS, 
    default: USER_STATUS.ACTIVE 
  })
  status: USER_STATUS;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

// Indexes
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

export type UserDocument = UserModel & Document & ITimestamps;