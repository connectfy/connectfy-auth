import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeactivatedUser } from '../interface/deactivated-user.intreface';
import { v4 as uuid } from 'uuid';
import { ITimestamps } from '@/src/common/interfaces/date.interface';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Schema({ timestamps: true, collection: COLLECTIONS.AUTH.USER.DEACTIVATED })
export class DeactivatedUserModel implements IDeactivatedUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, unique: true, ref: COLLECTIONS.AUTH.USER.USERS })
  userId: string;
}

export const DeactivatedUserSchema =
  SchemaFactory.createForClass(DeactivatedUserModel);
export type DeactivatedUserDocument = DeactivatedUserModel &
  Document &
  ITimestamps;
