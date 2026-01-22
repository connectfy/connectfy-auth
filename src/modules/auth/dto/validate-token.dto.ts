import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';
import { TOKEN_TYPE } from '@/src/common/enums/enums';

export class ValidateTokenDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: TOKEN_TYPE,
  })
  type: TOKEN_TYPE;
}
