import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeactivatedUser } from '../interface/deactivated-user.intreface';
import { v4 as uuid } from 'uuid';
import { ITimestamps } from '@/src/common/interfaces/date.interface';

@Schema({ timestamps: true, collection: 'deactivated-users' })
export class DeactivatedUserModel implements IDeactivatedUser {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, unique: true, ref: 'User' })
  userId: string;
}

export const DeactivatedUserSchema =
  SchemaFactory.createForClass(DeactivatedUserModel);
export type DeactivatedUserDocument = DeactivatedUserModel &
  Document &
  ITimestamps;
