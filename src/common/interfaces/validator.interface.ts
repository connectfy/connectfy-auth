import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';
import {
  IsIpVersion,
  IsNumberOptions,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ClassConstructor } from 'class-transformer';

export interface IBaseFieldOptions {
  type: FIELD_TYPE;
  isOptional?: boolean;
  customMessage?: string;
  validateIf?: (object: any, value: any) => boolean;
  classType?: ClassConstructor<any>;
  validateNested?: ValidationOptions;
  validationOptions?: ValidationOptions;
}

export interface IStringFieldOptions extends IBaseFieldOptions {
  type:
    | FIELD_TYPE.STRING
    | FIELD_TYPE.UUID
    | FIELD_TYPE.EMAIL
    | FIELD_TYPE.URL
    | FIELD_TYPE.PHONE
    | FIELD_TYPE.JSON
    | FIELD_TYPE.JWT
    | FIELD_TYPE.LOWERCASE
    | FIELD_TYPE.UPPERCASE
    | FIELD_TYPE.HEX_COLOR
    | FIELD_TYPE.BASE64
    | FIELD_TYPE.IP
    | FIELD_TYPE.MAC_ADDRESS;
  minLength?: number;
  maxLength?: number;

  // Regex for patterns
  matches?: {
    regexp: RegExp;
    message: {
      type: VALIDATION_TYPE;
      params?: Record<string, any>;
    };
  };

  // Phone specific
  region?: string; // 'AZ', 'US', və s.

  // UUID specific
  uuidVersion?: validator.UUIDVersion;

  // IP specific
  ipVersion?: IsIpVersion;

  // Email spesific
  emailOptions?: validator.IsEmailOptions;

  // URL spesific
  urlOptions?: validator.IsURLOptions;

  // Base64 spesific
  base64Options?: validator.IsBase64Options;
}

export interface INumberFieldOptions extends IBaseFieldOptions {
  type:
    | FIELD_TYPE.NUMBER
    | FIELD_TYPE.INT
    | FIELD_TYPE.POSITIVE
    | FIELD_TYPE.NEGATIVE
    | FIELD_TYPE.DECIMAL
    | FIELD_TYPE.LATITUDE
    | FIELD_TYPE.LONGITUDE;
  min?: number;
  max?: number;

  // Decimal specific
  decimalOptions?: validator.IsDecimalOptions;

  // Regex for patterns
  matches?: {
    regexp: RegExp;
    message: {
      type: VALIDATION_TYPE;
      params?: Record<string, any>;
    };
  };

  // Number spesific
  numberOptions?: IsNumberOptions;
}

export interface IEnumFieldOptions extends IBaseFieldOptions {
  type: FIELD_TYPE.ENUM;
  enumObject: object;
  enumValues?: string[];
}

export interface IDateFieldOptions extends IBaseFieldOptions {
  type: FIELD_TYPE.DATE | FIELD_TYPE.DATE_STRING;
  minDate?: Date;
  maxDate?: Date;

  // DateString spesific
  dateStringOptions?: validator.IsISO8601Options;
}

export interface IArrayFieldOptions extends IBaseFieldOptions {
  type: FIELD_TYPE.ARRAY;
  minSize?: number;
  maxSize?: number;
  arrayItemType?: FIELD_TYPE;
  unique?: boolean;
}

export interface IObjectFieldOptions extends IBaseFieldOptions {
  type: FIELD_TYPE.OBJECT;
}

export interface IBooleanFieldOptions extends IBaseFieldOptions {
  type: FIELD_TYPE.BOOLEAN;
}

export type FieldValidatorOptions =
  | IStringFieldOptions
  | INumberFieldOptions
  | IEnumFieldOptions
  | IDateFieldOptions
  | IArrayFieldOptions
  | IObjectFieldOptions
  | IBooleanFieldOptions;

export interface IValidateMessageOptions {
  args: ValidationArguments;
  type: VALIDATION_TYPE;
  [key: string]: any;
}
