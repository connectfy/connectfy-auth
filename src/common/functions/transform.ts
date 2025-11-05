import { HttpStatus } from '@nestjs/common';
import {
  ExceptionMessages,
  ExceptionTypes,
} from '../constants/exception.constants';
import { BaseException } from '../exceptions/base.exception';

export function stringTransform({ value, key }) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value !== 'string') {
    throw new BaseException(
      ExceptionMessages.STRING_OR_NULL_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }
  const trimmedValue = value.trim();
  if (trimmedValue === '') {
    return null;
  }
  return trimmedValue;
}

export function numberTransform({ value, key }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    if (isNaN(value)) {
      throw new BaseException(
        ExceptionMessages.NUMBER_OR_NULL_MESSAGE(key),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue === '') return null;
    const num = Number(trimmedValue);
    if (isNaN(num)) {
      throw new BaseException(
        ExceptionMessages.NUMBER_OR_NULL_MESSAGE(key),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }
    return num;
  }

  throw new BaseException(
    ExceptionMessages.NUMBER_OR_NULL_MESSAGE(key),
    HttpStatus.BAD_REQUEST,
    ExceptionTypes.BAD_REQUEST,
  );
}

export function arrayTransform({ value, key }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Array.isArray(value)) {
    throw new BaseException(
      ExceptionMessages.ARRAY_TYPE_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  if (value.length === 0) {
    throw new BaseException(
      ExceptionMessages.ARRAY_MIN_ONE_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  return value;
}

export function objectTransform({ value, key }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new BaseException(
      ExceptionMessages.OBJECT_TYPE_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  if (Object.keys(value).length === 0) {
    throw new BaseException(
      ExceptionMessages.OBJECT_MIN_ONE_PROPERTY_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  return value;
}

export function dateTransform({ value, key }) {
  if (value === undefined || value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new BaseException(
        ExceptionMessages.DATE_OR_NULL_MESSAGE(key),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }
    return value;
  }

  const parsedValue = !isNaN(Number(value));

  if (parsedValue) {
    throw new BaseException(
      ExceptionMessages.DATE_OR_NULL_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;

    if (!isNaN(Number(trimmed))) {
      throw new BaseException(
        ExceptionMessages.DATE_OR_NULL_MESSAGE(key),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    const date = new Date(trimmed);

    if (isNaN(date.getTime())) {
      throw new BaseException(
        ExceptionMessages.DATE_OR_NULL_MESSAGE(key),
        HttpStatus.BAD_REQUEST,
        ExceptionTypes.BAD_REQUEST,
      );
    }

    return date;
  }

  throw new BaseException(
    ExceptionMessages.DATE_OR_NULL_MESSAGE(key),
    HttpStatus.BAD_REQUEST,
    ExceptionTypes.BAD_REQUEST,
  );
}

export function booleanTransform({ value, key }) {
  if (value === undefined || value === null) {
    throw new BaseException(
      ExceptionMessages.BOOLEAN_INVALID_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    throw new BaseException(
      ExceptionMessages.BOOLEAN_INVALID_MESSAGE(key),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );
  }

  throw new BaseException(
    ExceptionMessages.BOOLEAN_TYPE_MESSAGE(key),
    HttpStatus.BAD_REQUEST,
    ExceptionTypes.BAD_REQUEST,
  );
}

export function enumTransform<T extends object>({
  value,
  key,
  enumObject,
}: {
  value: any;
  key: string;
  enumObject: T;
}): T[keyof T] | null {
  if (value === undefined || value === null) {
    return null;
  }

  const enumValues = Object.values(enumObject);
  if (enumValues.includes(value)) {
    return value;
  }

  throw new BaseException(
    ExceptionMessages.ENUM_INVALID_MESSAGE(key, enumValues),
    HttpStatus.BAD_REQUEST,
    ExceptionTypes.BAD_REQUEST,
  );
}

export function upperCaseTranform(value: any) {
  if (value === undefined || value === null) return null;

  if (typeof value !== 'string')
    throw new BaseException(
      ExceptionMessages.STRING_OR_NULL_MESSAGE(value),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );

  return value.toUpperCase();
}

export function lowerCaseTranform(value: any) {
  if (value === undefined || value === null) return null;

  if (typeof value !== 'string')
    throw new BaseException(
      ExceptionMessages.STRING_OR_NULL_MESSAGE(value),
      HttpStatus.BAD_REQUEST,
      ExceptionTypes.BAD_REQUEST,
    );

  return value.toLowerCase();
}
