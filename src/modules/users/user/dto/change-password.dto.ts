import { FieldValidator, FIELD_TYPE, VALIDATION_TYPE } from 'connectfy-shared';

export class ChangePasswordDto {
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
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}
