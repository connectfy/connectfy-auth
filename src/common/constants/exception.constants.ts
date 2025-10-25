import i18n from '@/src/i18n';
import { LANGUAGE } from './common.enum';

export const ExceptionMessages = {
  INTERNAL_SERVER_ERROR_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.internal_server_error_message', { lng: lang }),

  BAD_REQUEST_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.bad_request_message', { lng: lang }),

  UNAUTHORIZED_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.unauthorized_message', { lng: lang }),

  FORBIDDEN_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.forbidden_message', { lng: lang }),

  NOT_FOUND_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.not_found_message', { lng: lang }),

  CONFLICT_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.conflict_message', { lng: lang }),

  UNPROCESSABLE_ENTITY_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.unprocessable_entity_message', { lng: lang }),

  GONE_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.gone_message', { lng: lang }),

  TOO_MANY_REQUESTS_MESSAGE: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.too_many_requests_message', { lng: lang }),

  ACCESS_TOKEN_EXPIRED: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.access_token_expired', { lng: lang }),

  TOKEN_EXPIRED: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.token_expired', { lng: lang }),

  ALREADY_EXISTS_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.already_exists_message', { field, lng: lang }),

  INVALID_CREDENTIALS: (lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.invalid_credentials', { lng: lang }),

  BANNED_MESSAGE: (bannedToDate: Date, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.banned_message', {
      bannedToDate: bannedToDate?.toISOString?.() ?? String(bannedToDate),
      lng: lang,
    }),

  SAME_DATA: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('validation_messages.same_data', { field, lng: lang }),

  STRING_OR_NULL_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.string_or_null', { field, lng: lang }),

  NUMBER_OR_NULL_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.number_or_null', { field, lng: lang }),

  ARRAY_TYPE_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.array_type', { field, lng: lang }),

  ARRAY_MIN_ONE_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.array_min_one', { field, lng: lang }),

  OBJECT_TYPE_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.object_type', { field, lng: lang }),

  OBJECT_MIN_ONE_PROPERTY_MESSAGE: (
    field: string,
    lang: LANGUAGE = LANGUAGE.EN,
  ) =>
    i18n.t('exception_messages.object_min_one_property', {
      field,
      lng: lang,
    }),

  DATE_OR_NULL_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.date_or_null', { field, lng: lang }),

  BOOLEAN_TYPE_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.boolean_type', { field, lng: lang }),

  BOOLEAN_INVALID_MESSAGE: (field: string, lang: LANGUAGE = LANGUAGE.EN) =>
    i18n.t('exception_messages.boolean_invalid', {
      field,
      lng: lang,
    }),

  ENUM_INVALID_MESSAGE: (
    field: string,
    validValues: any[],
    lang: LANGUAGE = LANGUAGE.EN,
  ) =>
    i18n.t('validation_messages.enum_invalid', {
      field,
      validValues: validValues.join(', '),
      lng: lang,
    }),
};

export const ExceptionTypes = {
  INTERNAL_SERVER_ERROR: 'InternalServerError',
  BAD_REQUEST: 'BadRequest',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'NotFound',
  CONFLICT: 'Conflict',
  UNPROCESSABLE_ENTITY: 'UnprocessableEntity',
  GONE: 'Gone',
  TOO_MANY_REQUESTS: 'TooManyRequests',
  ALREADY_EXISTS: 'AlreadyExists',
};
