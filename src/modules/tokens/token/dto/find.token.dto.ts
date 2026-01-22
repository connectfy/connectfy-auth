import { FIELD_TYPE, LANGUAGE } from '@/src/common/enums/enums';
import { BaseFindDto } from '@common/dto/base.find.dto';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class FindTokenDto extends BaseFindDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: LANGUAGE,
  })
  _lang?: LANGUAGE;
}
