import { FIELD_TYPE, LANGUAGE } from '@/src/common/enums/enums';
import { BaseRemoveAllDto, BaseRemoveDto } from '@common/dto/base.remove.dto';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class RemoveBannedUserDto extends BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: LANGUAGE,
  })
  _lang?: LANGUAGE;
}

export class RemoveAllBannedUsersDto extends BaseRemoveAllDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: LANGUAGE,
  })
  _lang?: LANGUAGE;
}
