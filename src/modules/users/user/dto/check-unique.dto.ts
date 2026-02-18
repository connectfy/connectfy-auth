import {
  FieldValidator,
  FIELD_TYPE,
  CHECK_UNIQUE_FIELD,
} from 'connectfy-shared';

export class CheckUniqueDto {
  @FieldValidator({ type: FIELD_TYPE.ENUM, enumObject: CHECK_UNIQUE_FIELD })
  field: CHECK_UNIQUE_FIELD;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  value: string;
}
