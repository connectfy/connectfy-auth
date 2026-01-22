import { FIELD_TYPE, LANGUAGE } from '@/src/common/enums/enums';
import { BaseRemoveDto } from '@common/dto/base.remove.dto';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class RemoveUserDto extends BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
