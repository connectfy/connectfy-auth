import { PopulateOption } from './populate.option.dto';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';

export class BaseFindDto {
  @FieldValidator({
    type: FIELD_TYPE.INT,
    isOptional: true,
    classType: Number,
  })
  limit?: number;

  @FieldValidator({
    type: FIELD_TYPE.INT,
    isOptional: true,
    classType: Number,
  })
  skip?: number;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    isOptional: true,
  })
  sort?: Record<string, 1 | -1>;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    isOptional: true,
  })
  query?: Record<string, any>;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  fields?: string;

  @FieldValidator({
    type: FIELD_TYPE.ARRAY,
    isOptional: true,
    validateNested: { each: true },
    classType: PopulateOption,
  })
  populate?: PopulateOption[];
}
