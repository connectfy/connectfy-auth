import { FIELD_TYPE } from '@common/enums/enums';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class DeactivateAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;
}
