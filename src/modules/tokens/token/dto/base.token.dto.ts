import { FIELD_TYPE, TOKEN_TYPE, FieldValidator } from 'connectfy-shared';

export class BaseTokenDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: TOKEN_TYPE,
  })
  type: TOKEN_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.DATE,
  })
  expiresAt: Date;
}
