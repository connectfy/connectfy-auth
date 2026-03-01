import {
  DELETE_REASON,
  DELETE_REASON_CODE,
  FIELD_TYPE,
  FieldValidator,
} from 'connectfy-shared';

export class BaseUserDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: DELETE_REASON,
  })
  reason: DELETE_REASON;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: DELETE_REASON_CODE,
  })
  reasonCode: DELETE_REASON_CODE | null;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
    maxLength: 200,
  })
  reasonDescription: string | null;
}
