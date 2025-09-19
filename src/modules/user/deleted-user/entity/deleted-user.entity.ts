import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IDeletedUser } from '../interface/deleted-user.interface';

@Schema({ timestamps: true, collection: 'deleted-users' })
export class DeletedUserModel implements IDeletedUser {
  @Prop({ type: String, unique: true, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  email: string;
}

export const DeletedUserSchema = SchemaFactory.createForClass(DeletedUserModel);
export type DeletedUserDocument = DeletedUserModel & Document;
