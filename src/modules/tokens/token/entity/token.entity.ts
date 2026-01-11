import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import { IToken } from '../interface/token.interface';
import { TOKEN_TYPE } from '@/src/common/enums/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser } from '@modules/users/user/interface/user.interface';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Schema({ timestamps: true, collection: COLLECTIONS.AUTH.TOKEN.TOKENS })
export class TokenModel implements IToken {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true, ref: COLLECTIONS.AUTH.USER.USERS })
  userId: string;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: String, enum: TOKEN_TYPE, default: TOKEN_TYPE.PASSWORD_RESET })
  type: TOKEN_TYPE;

  @Prop({ type: Date, required: false })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  isUsed: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(TokenModel);
export type TokenDocument = TokenModel &
  Document & {
    userId?: string | IUser;
  };
