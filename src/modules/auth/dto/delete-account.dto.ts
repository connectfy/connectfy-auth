import { FIELD_TYPE, FieldValidator, DELETE_REASON } from 'connectfy-shared';

export class DeleteAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: DELETE_REASON,
  })
  reason: DELETE_REASON;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
    maxLength: 1000,
  })
  otherReason: string | null;
}
