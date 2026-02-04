import { FieldValidator } from '@/src/common/decorators/field-validator/field-validator.decorator';
import { CHECK_UNIQUE_FIELD, FIELD_TYPE } from '@/src/common/enums/enums';

export class CheckUniqueDto {
  @FieldValidator({ type: FIELD_TYPE.ENUM, enumObject: CHECK_UNIQUE_FIELD })
  field: CHECK_UNIQUE_FIELD;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  value: string;
}