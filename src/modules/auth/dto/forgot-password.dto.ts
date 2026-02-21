import {
  FIELD_TYPE,
  FieldValidator,
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
} from 'connectfy-shared';

export class ForgotPasswordDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: FORGOT_PASSWORD_IDENTIFIER_TYPE,
  })
  identifierType: FORGOT_PASSWORD_IDENTIFIER_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  identifier: string;
}
