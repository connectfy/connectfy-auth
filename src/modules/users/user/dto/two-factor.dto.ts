import {
  FIELD_TYPE,
  FieldValidator,
  TWO_FACTOR_ACTION,
} from 'connectfy-shared';

export class TwoFactorDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: TWO_FACTOR_ACTION,
  })
  action: TWO_FACTOR_ACTION;
}
