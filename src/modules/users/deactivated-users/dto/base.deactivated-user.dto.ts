import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';

export class BaseDeactivatedUserDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;
}
