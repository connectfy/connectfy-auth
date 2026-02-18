import { FieldValidator, FIELD_TYPE, VALIDATION_TYPE } from 'connectfy-shared';

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
