import { TOKEN_TYPE } from '@common/constants/common.enum';

export interface IToken {
  _id: string;
  userId: string;
  token: string;
  type: TOKEN_TYPE;
  expiresAt: Date;
  isUsed: boolean;
}

export interface IReturnedToken {
  _id?: string;
  userId?: string;
  token?: string;
  type?: TOKEN_TYPE;
  expiresAt?: Date;
  isUsed?: boolean;
}
