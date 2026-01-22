import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE, LANGUAGE } from '@/src/common/enums/enums';

export class BaseUserDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  username: string;

  @FieldValidator({
    type: FIELD_TYPE.EMAIL,
  })
  email: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  password: string;
}
