import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { IToken } from '../interface/token.interface';
import { TOKEN_TYPE } from '@common/constants/common.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'tokens' })
export class TokenModel implements IToken {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: 'User' })
  userId: string;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, enum: TOKEN_TYPE, default: TOKEN_TYPE.PASSWORD_RESET })
  type: TOKEN_TYPE;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);
export type TokenDocument = TokenModel & Document;
