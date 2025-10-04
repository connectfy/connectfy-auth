export enum ROLE {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

export enum PROVIDER {
  PASSWORD = 'PASSWORD',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

export enum GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum TOKEN_TYPE {
  PASSWORD_RESET = 'PASSWORD_RESET',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  RESTORE_ACCOUNT = 'RESTORE_ACCOUNT',
}

export enum IDENTIFIER_TYPE {
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

export enum GOOGLE_AUTH_LOGIN_TYPE {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
}

export enum FORGOT_PASSWORD_IDENTIFIER_TYPE {
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
}

export enum LANGUAGE {
  EN = 'en',
  AZ = 'az',
  RU = 'ru',
  TR = 'tr',
}
