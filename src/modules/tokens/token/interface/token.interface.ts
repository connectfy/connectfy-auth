import { TOKEN_TYPE } from '@/src/common/enums/enums';

export interface IToken {
  _id: string;
  userId: string;
  token: string;
  type: TOKEN_TYPE;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnedToken {
  _id: string;
  userId: string | Record<string, any>;
  token: string;
  type: TOKEN_TYPE;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
