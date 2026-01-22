import { FIELD_TYPE, TOKEN_TYPE } from '@/src/common/enums/enums';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class BaseTokenDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: TOKEN_TYPE,
  })
  type: TOKEN_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.DATE,
  })
  expiresAt: Date;
}
