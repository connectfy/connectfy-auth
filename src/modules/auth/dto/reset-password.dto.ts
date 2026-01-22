import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE, LANGUAGE, VALIDATION_TYPE } from '@common/enums/enums';

export class ResetPasswordDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  resetToken: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 8,
    maxLength: 30,
    matches: {
      regexp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,30}$/,
      message: {
        type: VALIDATION_TYPE.PASSWORD,
      },
    },
  })
  password: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 8,
    maxLength: 30,
  })
  confirmPassword: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
