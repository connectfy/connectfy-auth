import {
  FIELD_TYPE,
  FieldValidator,
  DELETE_REASON_CODE,
} from 'connectfy-shared';

export class DeleteAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: DELETE_REASON_CODE,
  })
  reasonCode: DELETE_REASON_CODE;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
    maxLength: 200,
  })
  reasonDescription: string | null;
}
