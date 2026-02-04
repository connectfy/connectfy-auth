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

export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
  BANNED = 'BANNED',
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
  CHANGE_USERNAME = 'CHANGE_USERNAME',
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  CHANGE_PHONE_NUMBER = 'CHANGE_PHONE_NUMBER',
  DEACTIVATE_ACCOUNT = 'DEACTIVATE_ACCOUNT',
}

export enum PHONE_NUMBER_ACTION {
  UPDATE = 'UPDATE',
  REMOVE = 'REMOVE',
}

export enum IDENTIFIER_TYPE {
  USERNAME = 'USERNAME',
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  FACE_DESCRIPTOR = 'FACE_DESCRIPTOR',
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

export enum THEME {
  DARK = 'dark',
  LIGHT = 'light',
  DEVICE = 'device',
}

export enum STARTUP_PAGE {
  MESSENGER = 'MESSENGER',
  GROUPS = 'GROUPS',
  CHANNELS = 'CHANNELS',
  USERS = 'USERS',
  NOTIFICATION = 'NOTIFICATION',
  PROFILE = 'PROFILE',
}

export enum TIME_FORMAT {
  H24 = '24h',
  H12 = '12h',
}

export enum DATE_FORMAT {
  DDMMYYYY = 'DD/MM/YYYY',
  MMDDYYYY = 'MM/DD/YYYY',
}

export enum NOTIFICATION_SOUND_MODE {
  SOUND = 'SOUND',
  SILENT = 'SILENT',
  DND = 'DND',
}

export enum NOTIFICATION_CONTENT_MODE {
  HEADER_AND_CONTENT = 'HEADER_AND_CONTENT',
  HEADER_ONLY = 'HEADER_ONLY',
  HIDE_NOTIFICATION = 'HIDE_NOTIFICATION',
}

export enum PRIVACY_SETTINGS_CHOICE {
  EVERYONE = 'EVERYONE',
  MY_FRIENDS = 'MY_FRIENDS',
  NOBODY = 'NOBODY',
}

export enum DELETE_REASON {
  USER_REQUEST = 'USER_REQUEST',
  TERMS_VIOLATION = 'TERMS_VIOLATION',
  SPAM = 'SPAM',
  FRAUD = 'FRAUD',
  SECURITY = 'SECURITY',
  INACTIVITY = 'INACTIVITY',
  ADMIN_ACTION = 'ADMIN_ACTION',
  OTHER = 'OTHER',
}

export enum DEVICE_TYPE {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  TABLET = 'TABLET',
  DESKTOP = 'DESKTOP',
  UNKNOWN = 'UNKNOWN',
}

export enum BROWSER_TYPE {
  CHROME = 'CHROME',
  FIREFOX = 'FIREFOX',
  SAFARI = 'SAFARI',
  EDGE = 'EDGE',
  OPERA = 'OPERA',
  BRAVE = 'BRAVE',
  SAMSUNG = 'SAMSUNG',
  UNKNOWN = 'UNKNOWN',
}

export enum OS_TYPE {
  WINDOWS = 'WINDOWS',
  MACOS = 'MACOS',
  LINUX = 'LINUX',
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  UNKNOWN = 'UNKNOWN',
}

export enum TIME_DIFFERENCE_TYPE {
  NOW = 'just_now',
  MINUTE = 'minutes_ago',
  HOUR = 'hours_ago',
  DAY = 'days_ago',
}

export enum CLS_KEYS {
  USER = 'user',
  LANG = 'lang',
  ACCOUNT = 'account',
  SETTINGS = 'settings',
}

export enum FIELD_TYPE {
  // String əsaslı
  STRING = 'string', // @IsString
  UUID = 'uuid', // @IsUUID
  EMAIL = 'email', // @IsEmail
  URL = 'url', // @IsUrl
  ENUM = 'enum', // @IsEnum
  PHONE = 'phone', // @IsPhoneNumber
  JSON = 'json', // @IsJSON
  JWT = 'jwt', // @IsJWT
  LOWERCASE = 'lowercase', // @IsLowercase
  UPPERCASE = 'uppercase', // @IsUppercase
  HEX_COLOR = 'hex_color', // @IsHexColor
  BASE64 = 'base64', // @IsBase64
  IP = 'ip', // @IsIP
  MAC_ADDRESS = 'mac_address', // @IsMACAddress

  // Number əsaslı
  NUMBER = 'number', // @IsNumber
  INT = 'int', // @IsInt
  POSITIVE = 'positive', // @IsPositive
  NEGATIVE = 'negative', // @IsNegative
  DECIMAL = 'decimal', // @IsDecimal
  LATITUDE = 'latitude', // @IsLatitude
  LONGITUDE = 'longitude', // @IsLongitude

  // Boolean
  BOOLEAN = 'boolean', // @IsBoolean

  // Date & Time
  DATE = 'date', // @IsDate
  DATE_STRING = 'date_string', // @IsDateString

  // Array
  ARRAY = 'array', // @IsArray

  // Object
  OBJECT = 'object', // @IsObject
}

export enum VALIDATION_TYPE {
  REQUIRED = 'required',
  STRING = 'string',
  INT = 'int',
  NUMBER = 'number',
  MIN = 'min',
  MAX = 'max',
  DATE = 'date',
  UUID = 'uuid',
  ARRAY = 'array',
  ENUM = 'enum',
  BOOLEAN = 'boolean',
  EXISTS = 'exist',
  AVAILABLE = 'available',
  NOT_ALLOWED_FIELD = 'not_allowed_field',
  TYPE_MISMATCH = 'type_mismatch',
  OBJECT = 'object',
  EMAIL = 'email',
  MISMATCH = 'mismatch',
  PASSWORD = 'password',
  INVALID_LENGTH = 'invalid_length',
  ARRAY_EACH = 'array_each',
  PHONE_CODE = 'phone_code',
  FULL_PHONE = 'full_phone',
  URL = 'url',
  PHONE = 'phone',
  JSON = 'json',
  JWT = 'jwt',
  LOWERCASE = 'lowercase',
  UPPERCASE = 'uppercase',
  HEX_COLOR = 'hex_color',
  BASE64 = 'base64',
  IP = 'ip',
  MAC_ADDRESS = 'mac_address',
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  DECIMAL = 'decimal',
  LATITUDE = 'latitude',
  LONGITUDE = 'longitude',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  ARRAY_MIN_SIZE = 'array_min_size',
  ARRAY_MAX_SIZE = 'array_max_size',
  ARRAY_UNIQUE = 'array_unique',
  MIN_DATE = 'min_date',
  MAX_DATE = 'max_date',
}

export enum CHECK_UNIQUE_FIELD {
  USERNAME = 'username',
  EMAIL = 'email',
  PHONE_NUMBER = 'phone_number',
}
