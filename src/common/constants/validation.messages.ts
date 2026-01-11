import i18n from '@/src/i18n';
import { ValidationArguments } from 'class-validator';
import { LANGUAGE } from '../enums/enums';

export const getLang = (args: ValidationArguments): LANGUAGE => {
  return ((args.object as any)._lang || LANGUAGE.EN) as LANGUAGE;
};

export const getFieldName = (field: string, lang: LANGUAGE) => {
  return i18n.t(`fields.${field}`, { lng: lang });
};

export const ValidationMessages = {
  REQUIRED: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.required', {
      field,
      lng: lang,
    });
  },

  STRING: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.string', {
      field,
      lng: lang,
    });
  },

  INT: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.int', {
      field,
      lng: lang,
    });
  },

  NUMBER: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t(`validation_messages.number`, {
      field,
      lng: lang,
    });
  },

  MIN: (field: string, min: number) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.min', {
      field,
      min,
      lng: lang,
    });
  },

  MAX: (field: string, min: number) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.max', {
      field,
      min,
      lng: lang,
    });
  },

  DATE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.date', {
      field,
      lng: lang,
    });
  },

  UUID: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.uuid', {
      field,
      lng: lang,
    });
  },

  ARRAY: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.array', {
      field,
      lng: lang,
    });
  },

  ENUM: (field: string, values: string[]) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.enum', {
      field,
      values: values.join(', '),
      lng: lang,
    });
  },

  BOOLEAN: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.boolean', {
      field,
      lng: lang,
    });
  },

  EXISTS: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.exist', {
      field,
      lng: lang,
    });
  },

  AVAILABLE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.available', {
      field,
      lng: lang,
    });
  },

  NOT_ALLOWED_FIELD: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.not_allowed_field', {
      field,
      lng: lang,
    });
  },

  TYPE_MISMATCH:
    (field: string, expectedType: string) => (args: ValidationArguments) => {
      const lang = getLang(args);
      return i18n.t('validation_messages.type_mismatch', {
        field,
        expectedType,
        lng: lang,
      });
    },

  OBJECT: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.object', {
      field,
      lng: lang,
    });
  },

  EMAIL: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.email', {
      field,
      lng: lang,
    });
  },

  MISMATCH:
    (field: string, characters: string) => (args: ValidationArguments) => {
      const lang = getLang(args);
      return i18n.t('validation_messages.mismatch', {
        field,
        characters,
        lng: lang,
      });
    },

  PASSWORD: () => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.password', { lng: lang });
  },

  INVALID_LENGTH:
    (field: string, length: number) => (args: ValidationArguments) => {
      const lang = getLang(args);
      return i18n.t('validation_messages.invalid_length', {
        field,
        length,
        lng: lang,
      });
    },

  ARRAY_EACH: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);

    return i18n.t('validation_messages.array_each', {
      field,
      lng: lang,
    });
  },

  PHONE_CODE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.phone_code', {
      field,
      lng: lang,
    });
  },

  FULL_PHONE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.full_phone', {
      field,
      lng: lang,
    });
  },
};
