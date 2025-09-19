import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBannedUser } from '../interface/banned-user.interface';

@Schema({ timestamps: true, collection: 'banned-users' })
export class BannedUserModel implements IBannedUser {
  @Prop({ type: String, unique: true, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Date, required: false })
  bannedToDate: Date | null;
}

export const BannedUserSchema = SchemaFactory.createForClass(BannedUserModel);
export type BannedUserDocument = BannedUserModel & Document