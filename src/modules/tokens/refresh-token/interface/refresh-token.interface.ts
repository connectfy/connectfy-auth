export interface IRefreshToken {
  access_token?: string;
  refresh_token: string;
}

export interface IRefreshTokenPayload {
  [key: string]: string | number;
}

export interface ISaveRefreshToken {
  userId: string;
  refresh_token: string;
}

export interface IUpdateRefreshToken extends ISaveRefreshToken {}
