import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITimestamps } from '@common/interfaces/date.interface';
import { IDeletedUser } from '../interface/deleted-user.interface';
import { DELETE_REASON } from '@/src/common/enums/enums';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Schema({ timestamps: true, collection: COLLECTIONS.AUTH.USER.DELETED })
export class DeletedUserModel implements IDeletedUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, unique: true, ref: COLLECTIONS.AUTH.USER.USERS })
  userId: string;

  @Prop({ type: Date, required: true, default: Date.now })
  deletedAt: Date;

  @Prop({ type: String, required: true, enum: DELETE_REASON })
  reason: DELETE_REASON;

  @Prop({ type: String, required: false, default: null })
  otherReason: string | null;
}

export const DeletedUserSchema = SchemaFactory.createForClass(DeletedUserModel);
export type DeletedUserDocument = DeletedUserModel & Document & ITimestamps;
