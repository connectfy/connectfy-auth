import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { PROVIDER, ROLE } from '@common/constants/common.enum';
import { PhoneNumberModel } from './nested/phoneNumber.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITimestamps } from '@common/interfaces/date.interface';
import { IDeletedUser } from '../interface/deleted-user.interface';

@Schema({ timestamps: true, collection: 'deleted-users' })
export class DeletedUserModel implements IDeletedUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
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

  @Prop({ type: PhoneNumberModel, required: true, unique: true })
  phoneNumber: PhoneNumberModel;

  @Prop({ type: String, required: false })
  faceDescriptor?: string;
}

export const DeletedUserSchema = SchemaFactory.createForClass(DeletedUserModel);
export type DeletedUserDocument = DeletedUserModel & Document & ITimestamps;
