import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';

export class ChangeUsernameDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 3,
    maxLength: 30,
    matches: {
      regexp: /^[A-Za-z0-9._-]+$/,
      message: {
        type: VALIDATION_TYPE.MISMATCH,
        params: { characters: '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)' },
      },
    },
  })
  username: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}
