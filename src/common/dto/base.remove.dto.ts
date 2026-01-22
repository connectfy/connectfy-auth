import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '../enums/enums';

export class BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  _id: string;
}

export class BaseRemoveAllDto {
  @FieldValidator({
    type: FIELD_TYPE.ARRAY,
    minSize: 1,
    classType: String,
    validationOptions: { each: true },
  })
  _ids: string[];
}
