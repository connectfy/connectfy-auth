import {
  BaseRemoveDto,
  FieldValidator,
  FIELD_TYPE,
  LANGUAGE,
} from 'connectfy-shared';

export class RemoveUserDto extends BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;
}
