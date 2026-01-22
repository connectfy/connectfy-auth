import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';

export class PhoneNumberDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    matches: {
      regexp: /^\+\d+$/,
      message: {
        type: VALIDATION_TYPE.PHONE_CODE,
      },
    },
  })
  countryCode: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    matches: {
      regexp: /^\d+$/,
      message: {
        type: VALIDATION_TYPE.NUMBER,
      },
    },
  })
  number: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    matches: {
      regexp: /^\+\d+$/,
      message: {
        type: VALIDATION_TYPE.FULL_PHONE,
      },
    },
  })
  fullPhoneNumber: string;
}
