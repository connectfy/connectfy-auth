import i18n from '@/src/i18n';
import { LANGUAGE } from './common.enum';
import { ValidationArguments } from 'class-validator';

const getLang = (args: ValidationArguments): LANGUAGE => {
  return ((args.object as any)._lang || LANGUAGE.EN) as LANGUAGE;
};

const getFieldName = (field: string, lang: LANGUAGE) => {
  return i18n.t(`fields.${field}`, { lng: lang });
};

export const ValidationMessages = {
  REQUIRED: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.required', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  STRING: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.string', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  INT: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.int', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  MIN: (field: string, min: number) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.min', {
      field: getFieldName(field, lang),
      min,
      lng: lang,
    });
  },

  DATE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.date', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  UUID: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.uuid', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  ARRAY: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.array', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  ENUM: (field: string, values: string[]) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.enum', {
      field: getFieldName(field, lang),
      values: values.join(', '),
      lng: lang,
    });
  },

  BOOLEAN: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.boolean', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  EXISTS: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.exist', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  AVAILABLE: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.available', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  NOT_ALLOWED_FIELD: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.not_allowed_field', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  TYPE_MISMATCH:
    (field: string, expectedType: string) => (args: ValidationArguments) => {
      const lang = getLang(args);
      return i18n.t('validation_messages.type_mismatch', {
        field: getFieldName(field, lang),
        expectedType,
        lng: lang,
      });
    },

  OBJECT: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.object', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  EMAIL: (field: string) => (args: ValidationArguments) => {
    const lang = getLang(args);
    return i18n.t('validation_messages.email', {
      field: getFieldName(field, lang),
      lng: lang,
    });
  },

  MISMATCH:
    (field: string, characters: string) => (args: ValidationArguments) => {
      const lang = getLang(args);
      return i18n.t('validation_messages.mismatch', {
        field: getFieldName(field, lang),
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
        field: getFieldName(field, lang),
        length,
        lng: lang,
      });
    },
};
