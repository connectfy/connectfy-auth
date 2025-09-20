import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IRefreshToken } from '../interface/refresh-token.interface';

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshTokenModel implements IRefreshToken {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: String, required: true })
  refresh_token: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshTokenModel);
export type RefreshTokenDocument = RefreshTokenModel & Document;
