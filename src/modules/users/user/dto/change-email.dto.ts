import { FieldValidator, FIELD_TYPE } from 'connectfy-shared';

export class ChangeEmailDto {
  @FieldValidator({
    type: FIELD_TYPE.EMAIL,
    maxLength: 254,
  })
  email: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}

export class VerifyEmailChangeDto {
  @FieldValidator({
    type: FIELD_TYPE.JWT,
    maxLength: 1000,
  })
  token: string;
}
