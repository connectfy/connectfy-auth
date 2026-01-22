import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';
import {
  FORGOT_PASSWORD_IDENTIFIER_TYPE,
  LANGUAGE,
} from '@/src/common/enums/enums';

export class ForgotPasswordDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: FORGOT_PASSWORD_IDENTIFIER_TYPE,
  })
  identifierType: FORGOT_PASSWORD_IDENTIFIER_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  identifier: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
