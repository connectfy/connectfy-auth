import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';
import { LANGUAGE } from '@/src/common/enums/enums';

export class RestoreAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
