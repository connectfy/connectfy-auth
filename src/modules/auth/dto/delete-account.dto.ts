import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';
import { DELETE_REASON } from '@/src/common/enums/enums';

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
