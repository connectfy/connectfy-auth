import i18n from '@/src/i18n';
import { ValidationArguments } from 'class-validator';
import { CLS_KEYS, LANGUAGE } from '../enums/enums';
import { ClsServiceManager } from 'nestjs-cls';
import { IValidateMessageOptions } from '@common/interfaces/validator.interface';

export const getLang = (args: ValidationArguments): LANGUAGE => {
  // 1.️CLS
  try {
    const cls = ClsServiceManager.getClsService();
    const langInCls = cls?.get<LANGUAGE | undefined | null>(CLS_KEYS.LANG);
    if (langInCls) return langInCls;
  } catch {
    // CLS context yoxdursa → ignore
  }

  // 2. _lang inside DTO
  const dto = args?.object as any;
  const langInDto: LANGUAGE | undefined | null = dto?.lang;
  if (langInDto) return langInDto;

  // 3. Language inside _loggedUser
  const userLang: LANGUAGE | undefined =
    dto?._loggedUser?.settings?.generalSettings?.language;
  if (userLang) return userLang;

  // 4️. Final (Default)
  return LANGUAGE.EN;
};

export const validationMessage = ({
  args,
  type,
  params = {},
}: IValidateMessageOptions) => {
  return i18n.t(`validation_messages.${type}`, {
    lng: getLang(args),
    field: args.property,
    ...params,
  });
};

// export const ValidationMessages = {
//   REQUIRED: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.required', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   STRING: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.string', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   INT: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.int', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   NUMBER: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t(`validation_messages.number`, {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   MIN:
//     (args: ValidationArguments, min: number) => (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.min', {
//         field: getFieldName(args),
//         min,
//         lng: lang,
//       });
//     },
//
//   MAX:
//     (args: ValidationArguments, min: number) => (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.max', {
//         field: getFieldName(args),
//         min,
//         lng: lang,
//       });
//     },
//
//   DATE: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.date', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   UUID: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.uuid', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   ARRAY: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.array', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   ENUM:
//     (args: ValidationArguments, values: string[]) =>
//     (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.enum', {
//         field: getFieldName(args),
//         values: values.join(', '),
//         lng: lang,
//       });
//     },
//
//   BOOLEAN: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.boolean', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   EXISTS: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.exist', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   AVAILABLE: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.available', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   NOT_ALLOWED_FIELD:
//     (args: ValidationArguments) => (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.not_allowed_field', {
//         field: getFieldName(args),
//         lng: lang,
//       });
//     },
//
//   TYPE_MISMATCH:
//     (args: ValidationArguments, expectedType: string) =>
//     (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.type_mismatch', {
//         field: getFieldName(args),
//         expectedType,
//         lng: lang,
//       });
//     },
//
//   OBJECT: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.object', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   EMAIL: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.email', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   MISMATCH:
//     (args: ValidationArguments, characters: string) =>
//     (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.mismatch', {
//         field: getFieldName(args),
//         characters,
//         lng: lang,
//       });
//     },
//
//   PASSWORD: () => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.password', { lng: lang });
//   },
//
//   INVALID_LENGTH:
//     (args: ValidationArguments, length: number) =>
//     (args: ValidationArguments) => {
//       const lang = getLang(args);
//       return i18n.t('validation_messages.invalid_length', {
//         field: getFieldName(args),
//         length,
//         lng: lang,
//       });
//     },
//
//   ARRAY_EACH: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//
//     return i18n.t('validation_messages.array_each', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   PHONE_CODE: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.phone_code', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
//
//   FULL_PHONE: (args: ValidationArguments) => (args: ValidationArguments) => {
//     const lang = getLang(args);
//     return i18n.t('validation_messages.full_phone', {
//       field: getFieldName(args),
//       lng: lang,
//     });
//   },
// };
