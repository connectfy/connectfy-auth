import { DELETE_REASON, FIELD_TYPE } from '@/src/common/enums/enums';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

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
