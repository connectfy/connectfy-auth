import { FIELD_TYPE, TOKEN_TYPE, FieldValidator } from 'connectfy-shared';

export class ValidateTokenDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: TOKEN_TYPE,
  })
  type: TOKEN_TYPE;
}
