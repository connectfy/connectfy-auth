import { FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class RestoreAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}
