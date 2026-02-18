import {
  FIELD_TYPE,
  LANGUAGE,
  BaseRemoveAllDto,
  BaseRemoveDto,
  FieldValidator,
} from 'connectfy-shared';

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
