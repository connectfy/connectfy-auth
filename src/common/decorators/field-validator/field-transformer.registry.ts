import { FIELD_TYPE } from '@common/enums/enums';
import {
  FieldValidatorOptions,
  IEnumFieldOptions,
} from '@common/interfaces/validator.interface';
import { Transform } from 'class-transformer';
import {
  arrayTransform,
  booleanTransform,
  dateTransform,
  enumTransform,
  numberTransform,
  objectTransform,
  stringTransform,
} from '@common/functions/transform';

type TransformFactory = (opts: FieldValidatorOptions) => PropertyDecorator;

const STRING_TYPES = [
  FIELD_TYPE.STRING,
  FIELD_TYPE.EMAIL,
  FIELD_TYPE.UUID,
  FIELD_TYPE.URL,
  FIELD_TYPE.PHONE,
  FIELD_TYPE.JSON,
  FIELD_TYPE.JWT,
  FIELD_TYPE.LOWERCASE,
  FIELD_TYPE.UPPERCASE,
  FIELD_TYPE.HEX_COLOR,
  FIELD_TYPE.BASE64,
  FIELD_TYPE.IP,
  FIELD_TYPE.MAC_ADDRESS,
] as const;

const NUMBER_TYPES = [
  FIELD_TYPE.NUMBER,
  FIELD_TYPE.INT,
  FIELD_TYPE.POSITIVE,
  FIELD_TYPE.NEGATIVE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.LATITUDE,
  FIELD_TYPE.LONGITUDE,
] as const;

// ====================================================
// Transform decorator selector from class-transformer
// ====================================================
const make =
  (transformFn: (args: { key: string; value: any }) => any): TransformFactory =>
  () =>
    Transform(({ key, value }) => transformFn({ key, value }));

export const FIELD_TRANSFORMER_REGISTRY: Record<FIELD_TYPE, TransformFactory> =
  Object.fromEntries([
    ...STRING_TYPES.map((t) => [t, make(stringTransform)]),
    ...NUMBER_TYPES.map((t) => [t, make(numberTransform)]),
    [FIELD_TYPE.BOOLEAN, make(booleanTransform)],
    [FIELD_TYPE.DATE, make(dateTransform)],
    [FIELD_TYPE.DATE_STRING, make(stringTransform)],
    [FIELD_TYPE.ARRAY, make(arrayTransform)],
    [
      FIELD_TYPE.ENUM,
      (opts: IEnumFieldOptions) =>
        Transform(({ key, value }) =>
          enumTransform({ key, value, enumObject: opts.enumObject }),
        ),
    ],
    [FIELD_TYPE.OBJECT, make(objectTransform)],
  ]) as unknown as Record<FIELD_TYPE, TransformFactory>;
