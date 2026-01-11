import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBannedUser } from '../interface/banned-user.interface';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Schema({ timestamps: true, collection: COLLECTIONS.AUTH.USER.BANNED })
export class BannedUserModel implements IBannedUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: COLLECTIONS.AUTH.USER.USERS })
  userId: string;

  @Prop({ type: Date, required: false })
  bannedToDate: Date | null;
}

export const BannedUserSchema = SchemaFactory.createForClass(BannedUserModel);
export type BannedUserDocument = BannedUserModel & Document