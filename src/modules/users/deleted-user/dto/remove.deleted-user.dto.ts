import {
  FIELD_TYPE,
  LANGUAGE,
  BaseRemoveDto,
  FieldValidator,
} from 'connectfy-shared';

export class RemoveDeletedUserDto extends BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
