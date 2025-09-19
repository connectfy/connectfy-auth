import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { IUser } from '../interface/user.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PROVIDER, ROLE } from '@common/constants/common.enum';

@Schema({ timestamps: true, collection: 'users' })
export class UserModel implements IUser {
  @Prop({ type: String, unique: true, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, enum: ROLE, required: true, default: ROLE.USER })
  role: ROLE;

  @Prop({
    type: String,
    enum: PROVIDER,
    required: true,
    default: PROVIDER.PASSWORD,
  })
  provider: PROVIDER;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: String, required: false, default: null })
  faceDescriptor: string | null;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
export type UserDocument = UserModel & Document