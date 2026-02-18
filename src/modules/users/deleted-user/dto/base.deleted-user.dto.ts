import { DELETE_REASON, FIELD_TYPE, FieldValidator } from 'connectfy-shared';

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
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  otherReason: string | null;
}
