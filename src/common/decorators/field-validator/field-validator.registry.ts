import {
  IsString,
  IsUUID,
  IsEmail,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDate,
  IsUrl,
  IsPhoneNumber,
  IsJSON,
  IsJWT,
  IsLowercase,
  IsUppercase,
  IsHexColor,
  IsBase64,
  IsIP,
  IsMACAddress,
  IsPositive,
  IsNegative,
  IsDecimal,
  IsLatitude,
  IsLongitude,
  IsDateString,
  IsObject,
  MinDate,
  MaxDate,
  ArrayUnique,
  ArrayMaxSize,
  ArrayMinSize,
  Max,
  Min,
  MaxLength,
  MinLength,
  ValidationOptions,
} from 'class-validator';

import {
  FieldValidatorOptions,
  IArrayFieldOptions,
  IDateFieldOptions,
  IEnumFieldOptions,
  INumberFieldOptions,
  IStringFieldOptions,
} from '@common/interfaces/validator.interface';
import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';
import { validationMessage } from '@common/constants/validation.messages';

type DecoratorFactory = (opts: FieldValidatorOptions) => PropertyDecorator[];

/**
 * Helper function to create validation message options
 */
const createValidationOptions = (
  type: VALIDATION_TYPE,
  baseOptions?: ValidationOptions,
  params?: Record<string, any>,
) => ({
  message: (args: any) => validationMessage({ args, type, params }),
  ...baseOptions,
});

/**
 * Conditionally add decorator to array
 */
const addDecorator = (
  decorators: PropertyDecorator[],
  condition: boolean,
  decorator: PropertyDecorator,
) => {
  if (condition) decorators.push(decorator);
};

/**
 * Add string length validators (minLength, maxLength)
 */
const addStringLengthValidators = (
  decorators: PropertyDecorator[],
  opts: IStringFieldOptions,
) => {
  addDecorator(
    decorators,
    opts.minLength !== undefined,
    MinLength(
      opts.minLength!,
      createValidationOptions(
        VALIDATION_TYPE.MIN_LENGTH,
        opts.validationOptions,
        {
          minLength: opts.minLength,
        },
      ),
    ),
  );

  addDecorator(
    decorators,
    opts.maxLength !== undefined,
    MaxLength(
      opts.maxLength!,
      createValidationOptions(
        VALIDATION_TYPE.MAX_LENGTH,
        opts.validationOptions,
        {
          maxLength: opts.maxLength,
        },
      ),
    ),
  );
};

/**
 * Add number range validators (min, max)
 */
const addNumberRangeValidators = (
  decorators: PropertyDecorator[],
  opts: INumberFieldOptions,
) => {
  addDecorator(
    decorators,
    opts.min !== undefined,
    Min(
      opts.min!,
      createValidationOptions(VALIDATION_TYPE.MIN, opts.validationOptions, {
        min: opts.min,
      }),
    ),
  );

  addDecorator(
    decorators,
    opts.max !== undefined,
    Max(
      opts.max!,
      createValidationOptions(VALIDATION_TYPE.MAX, opts.validationOptions, {
        max: opts.max,
      }),
    ),
  );
};

/**
 * Add array size validators (minSize, maxSize, unique)
 */
const addArraySizeValidators = (
  decorators: PropertyDecorator[],
  opts: IArrayFieldOptions,
) => {
  addDecorator(
    decorators,
    opts.minSize !== undefined,
    ArrayMinSize(
      opts.minSize!,
      createValidationOptions(
        VALIDATION_TYPE.ARRAY_MIN_SIZE,
        opts.validationOptions,
        {
          minSize: opts.minSize,
        },
      ),
    ),
  );

  addDecorator(
    decorators,
    opts.maxSize !== undefined,
    ArrayMaxSize(
      opts.maxSize!,
      createValidationOptions(
        VALIDATION_TYPE.ARRAY_MAX_SIZE,
        opts.validationOptions,
        {
          maxSize: opts.maxSize,
        },
      ),
    ),
  );

  addDecorator(
    decorators,
    !!opts.unique,
    ArrayUnique(
      createValidationOptions(
        VALIDATION_TYPE.ARRAY_UNIQUE,
        opts.validationOptions,
      ),
    ),
  );
};

/**
 * Add date range validators (minDate, maxDate)
 */
const addDateRangeValidators = (
  decorators: PropertyDecorator[],
  opts: IDateFieldOptions,
) => {
  addDecorator(
    decorators,
    !!opts.minDate,
    MinDate(
      opts.minDate!,
      createValidationOptions(
        VALIDATION_TYPE.MIN_DATE,
        opts.validationOptions,
        {
          minDate: opts.minDate,
        },
      ),
    ),
  );

  addDecorator(
    decorators,
    !!opts.maxDate,
    MaxDate(
      opts.maxDate!,
      createValidationOptions(
        VALIDATION_TYPE.MAX_DATE,
        opts.validationOptions,
        {
          maxDate: opts.maxDate,
        },
      ),
    ),
  );
};

/**
 * Factory to create string field validators
 */
const createStringValidator = (
  type: VALIDATION_TYPE,
  extraDecorator?: (opts: IStringFieldOptions) => PropertyDecorator,
): DecoratorFactory => {
  return (opts: IStringFieldOptions) => {
    const decorators: PropertyDecorator[] = [
      IsString(
        createValidationOptions(VALIDATION_TYPE.STRING, opts.validationOptions),
      ),
    ];

    if (extraDecorator) {
      decorators.push(extraDecorator(opts));
    }

    addStringLengthValidators(decorators, opts);
    return decorators;
  };
};

/**
 * Factory to create number field validators
 */
const createNumberValidator = (
  validatorDecorator: (opts: INumberFieldOptions) => PropertyDecorator,
): DecoratorFactory => {
  return (opts: INumberFieldOptions) => {
    const decorators: PropertyDecorator[] = [validatorDecorator(opts)];
    addNumberRangeValidators(decorators, opts);
    return decorators;
  };
};

/**
 * Type decorator selector from class-validator
 */
export const FIELD_VALIDATOR_REGISTRY: Record<FIELD_TYPE, DecoratorFactory> = {
  // ================= STRING TYPES =================
  [FIELD_TYPE.STRING]: createStringValidator(VALIDATION_TYPE.STRING),

  [FIELD_TYPE.EMAIL]: createStringValidator(VALIDATION_TYPE.EMAIL, (opts) =>
    IsEmail(
      { ...opts.emailOptions },
      createValidationOptions(VALIDATION_TYPE.EMAIL, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.UUID]: createStringValidator(VALIDATION_TYPE.UUID, (opts) =>
    IsUUID(
      opts?.uuidVersion || '4',
      createValidationOptions(VALIDATION_TYPE.UUID, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.URL]: createStringValidator(VALIDATION_TYPE.URL, (opts) =>
    IsUrl(
      { ...opts.urlOptions },
      createValidationOptions(VALIDATION_TYPE.URL, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.PHONE]: createStringValidator(VALIDATION_TYPE.PHONE, (opts) =>
    IsPhoneNumber(
      opts?.region as any,
      createValidationOptions(VALIDATION_TYPE.PHONE, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.JSON]: createStringValidator(VALIDATION_TYPE.JSON, (opts) =>
    IsJSON(
      createValidationOptions(VALIDATION_TYPE.JSON, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.JWT]: createStringValidator(VALIDATION_TYPE.JWT, (opts) =>
    IsJWT(createValidationOptions(VALIDATION_TYPE.JWT, opts.validationOptions)),
  ),

  [FIELD_TYPE.LOWERCASE]: createStringValidator(
    VALIDATION_TYPE.LOWERCASE,
    (opts) =>
      IsLowercase(
        createValidationOptions(
          VALIDATION_TYPE.LOWERCASE,
          opts.validationOptions,
        ),
      ),
  ),

  [FIELD_TYPE.UPPERCASE]: createStringValidator(
    VALIDATION_TYPE.UPPERCASE,
    (opts) =>
      IsUppercase(
        createValidationOptions(
          VALIDATION_TYPE.UPPERCASE,
          opts.validationOptions,
        ),
      ),
  ),

  [FIELD_TYPE.HEX_COLOR]: createStringValidator(
    VALIDATION_TYPE.HEX_COLOR,
    (opts) =>
      IsHexColor(
        createValidationOptions(
          VALIDATION_TYPE.HEX_COLOR,
          opts.validationOptions,
        ),
      ),
  ),

  [FIELD_TYPE.BASE64]: createStringValidator(VALIDATION_TYPE.BASE64, (opts) =>
    IsBase64(
      { ...opts.base64Options },
      createValidationOptions(VALIDATION_TYPE.BASE64, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.IP]: createStringValidator(VALIDATION_TYPE.IP, (opts) =>
    IsIP(
      opts.ipVersion,
      createValidationOptions(VALIDATION_TYPE.IP, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.MAC_ADDRESS]: createStringValidator(
    VALIDATION_TYPE.MAC_ADDRESS,
    (opts) =>
      IsMACAddress(
        createValidationOptions(
          VALIDATION_TYPE.MAC_ADDRESS,
          opts.validationOptions,
        ),
      ),
  ),

  // ================= NUMBER TYPES =================
  [FIELD_TYPE.NUMBER]: createNumberValidator((opts: INumberFieldOptions) =>
    IsNumber(
      { ...opts.numberOptions },
      createValidationOptions(VALIDATION_TYPE.NUMBER, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.INT]: createNumberValidator((opts: INumberFieldOptions) =>
    IsInt(createValidationOptions(VALIDATION_TYPE.INT, opts.validationOptions)),
  ),

  [FIELD_TYPE.POSITIVE]: createNumberValidator((opts: INumberFieldOptions) =>
    IsPositive(
      createValidationOptions(VALIDATION_TYPE.POSITIVE, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.NEGATIVE]: createNumberValidator((opts: INumberFieldOptions) =>
    IsNegative(
      createValidationOptions(VALIDATION_TYPE.NEGATIVE, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.DECIMAL]: createNumberValidator((opts: INumberFieldOptions) =>
    IsDecimal(
      { ...opts.decimalOptions },
      createValidationOptions(VALIDATION_TYPE.DECIMAL, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.LATITUDE]: createNumberValidator((opts: INumberFieldOptions) =>
    IsLatitude(
      createValidationOptions(VALIDATION_TYPE.LATITUDE, opts.validationOptions),
    ),
  ),

  [FIELD_TYPE.LONGITUDE]: createNumberValidator((opts: INumberFieldOptions) =>
    IsLongitude(
      createValidationOptions(
        VALIDATION_TYPE.LONGITUDE,
        opts.validationOptions,
      ),
    ),
  ),

  // ================= BOOLEAN =================
  [FIELD_TYPE.BOOLEAN]: (opts) => [
    IsBoolean(
      createValidationOptions(VALIDATION_TYPE.BOOLEAN, opts.validationOptions),
    ),
  ],

  // ================= DATE TYPES =================
  [FIELD_TYPE.DATE]: (opts: IDateFieldOptions) => {
    const decorators: PropertyDecorator[] = [
      IsDate(
        createValidationOptions(VALIDATION_TYPE.DATE, opts.validationOptions),
      ),
    ];
    addDateRangeValidators(decorators, opts);
    return decorators;
  },

  [FIELD_TYPE.DATE_STRING]: (opts: IDateFieldOptions) => [
    IsDateString(
      { ...opts.dateStringOptions },
      createValidationOptions(VALIDATION_TYPE.DATE, opts.validationOptions),
    ),
  ],

  // ================= ARRAY =================
  [FIELD_TYPE.ARRAY]: (opts: IArrayFieldOptions) => {
    const decorators: PropertyDecorator[] = [
      IsArray(
        createValidationOptions(VALIDATION_TYPE.ARRAY, opts.validationOptions),
      ),
    ];
    addArraySizeValidators(decorators, opts);
    return decorators;
  },

  // ================= ENUM =================
  [FIELD_TYPE.ENUM]: (opts: IEnumFieldOptions) => [
    IsEnum(
      opts.enumObject,
      createValidationOptions(VALIDATION_TYPE.ENUM, opts.validationOptions, {
        values: Object.values(opts.enumObject),
      }),
    ),
  ],

  // ================= OBJECT =================
  [FIELD_TYPE.OBJECT]: (opts) => [
    IsObject(
      createValidationOptions(VALIDATION_TYPE.OBJECT, opts.validationOptions),
    ),
  ],
};
