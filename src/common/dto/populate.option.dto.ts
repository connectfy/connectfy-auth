import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';

export class PopulateOption {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  path?: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  select?: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  collection?: string;
}
