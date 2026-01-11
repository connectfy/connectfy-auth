import { ICountry } from '../interfaces/intrefaces';

export const COUNTRIES: ICountry[] = [
  {
    key: 'az',
    name: 'azerbaijan',
    flag: 'fi fi-az',
    code: '+994',
    numberLength: 9,
  },
  {
    key: 'tr',
    name: 'türkiye',
    flag: 'fi fi-tr',
    code: '+90',
    numberLength: 10,
  },
  { key: 'ru', name: 'russia', flag: 'fi fi-ru', code: '+7', numberLength: 10 },
  { key: 'us', name: 'usa', flag: 'fi fi-us', code: '+1', numberLength: 10 },
  { key: 'gb', name: 'uk', flag: 'fi fi-gb', code: '+44', numberLength: 10 },
  {
    key: 'de',
    name: 'germany',
    flag: 'fi fi-de',
    code: '+49',
    numberLength: 10,
  },
  { key: 'fr', name: 'france', flag: 'fi fi-fr', code: '+33', numberLength: 9 },
  { key: 'es', name: 'spain', flag: 'fi fi-es', code: '+34', numberLength: 9 },
  { key: 'it', name: 'italy', flag: 'fi fi-it', code: '+39', numberLength: 10 },
  { key: 'cn', name: 'china', flag: 'fi fi-cn', code: '+86', numberLength: 11 },
  { key: 'jp', name: 'japan', flag: 'fi fi-jp', code: '+81', numberLength: 10 },
  {
    key: 'kr',
    name: 'south_korea',
    flag: 'fi fi-kr',
    code: '+82',
    numberLength: 10,
  },
  {
    key: 'ua',
    name: 'ukraine',
    flag: 'fi fi-ua',
    code: '+380',
    numberLength: 9,
  },
  {
    key: 'ge',
    name: 'georgia',
    flag: 'fi fi-ge',
    code: '+995',
    numberLength: 9,
  },
  { key: 'ir', name: 'iran', flag: 'fi fi-ir', code: '+98', numberLength: 10 },
  { key: 'in', name: 'india', flag: 'fi fi-in', code: '+91', numberLength: 10 },
  { key: 'ca', name: 'canada', flag: 'fi fi-ca', code: '+1', numberLength: 10 },
  {
    key: 'kz',
    name: 'kazakhstan',
    flag: 'fi fi-kz',
    code: '+7',
    numberLength: 10,
  },
  {
    key: 'uz',
    name: 'uzbekistan',
    flag: 'fi fi-uz',
    code: '+998',
    numberLength: 9,
  },
  { key: 'ae', name: 'uae', flag: 'fi fi-ae', code: '+971', numberLength: 9 },
];

export const MICROSERVICE_NAMES = {
  ACCOUNT: {
    TCP: 'ACCOUNT_SERVICE_TCP',
    KAFKA: 'ACCOUNT_SERVICE_KAFKA',
  },
  AUTH: {
    TCP: 'AUTH_SERVICE_TCP',
  },
  MESSENGER: {
    TCP: 'MESSENGER_SERVICE_TCP',
  },
  RELATIONSHIP: {
    TCP: 'RELATIONSHIP_SERVICE_TCP',
  },
  NOTIFICATION: {
    TCP: 'NOTIFICATION_SERVICE_TCP',
    KAFKA: 'NOTIFICATION_SERVICE_KAFKA',
  },
};

export const ENV = {
  CORE: {
    APP: {
      NODE_ENV: 'NODE_ENV',
      PORT: 'PORT',
    },
    DATABASE: {
      MONGO: {
        URI: 'MONGO_URI',
        DB_NAME: 'DB_NAME',
      },
    },
  },

  GATEWAY: {
    CLIENT_URL: 'CLIENT_URL',
    SESSION_SECRET: 'SESSION_SECRET_KEY',
  },

  AUTH: {
    JWT: {
      ACCESS: {
        SECRET: 'JWT_ACCESS_SECRET',
        EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',
      },
      REFRESH: {
        SECRET: 'JWT_REFRESH_SECRET',
        EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',
      },
      ACTIONS: {
        FORGOT_PASSWORD: 'FORGOT_PASSWORD_SECRET',
        CHANGE_EMAIL: 'CHANGE_EMAIL_SECRET',
        RESTORE_ACCOUNT: 'RESTORE_ACCOUNT_SECRET',
      },
    },

    KEYS: {
      FACE_DESCRIPTOR: 'FACE_DESCRIPTOR_KEY',
      USER_PRIVATE: 'USER_PRIVATE_KEY',
    },
  },

  OAUTH: {
    GOOGLE: {
      CLIENT_ID: 'GOOGLE_CLIENT_ID',
      CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
      CALLBACK_URL: 'GOOGLE_CALLBACK_URL',
      REDIRECT_URL: 'GOOGLE_CLIENT_REDIRECT_URL',
    },
  },

  NOTIFICATION: {
    EMAIL: {
      HOST: 'EMAIL_HOST',
      USER: 'EMAIL_USER',
      PASS: 'EMAIL_PASS',
    },
  },
};

export const EXPIRE_DATES = {
  JWT: {
    ONE_HOUR: '1h',
    ONE_DAY: '1d',
    ONE_MONTH: '30d',
  },
  TOKEN: {
    ONE_MINUTE: 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 60 * 60 * 1000,
  },
};

export const COLLECTIONS = {
  AUTH: {
    USER: {
      USERS: 'users',
      BANNED: 'banned_users',
      DELETED: 'deleted_users',
      DEACTIVATED: 'deactivated_users',
    },
    TOKEN: {
      TOKENS: 'tokens',
      REFRESH_TOKENS: 'refresh_tokens',
    },
  },
  ACCOUNT: {
    ACCOUNTS: 'accounts',
    SOCIAL_LINKS: 'social_links',
    SETTINGS: {
      GENERAL: 'general_settings',
      PRIVACY: 'privacy_settings',
      NOTIFICATION: 'notification_settings',
    },
  },
};
