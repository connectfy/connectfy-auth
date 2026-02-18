import { FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class DeactivateAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}
