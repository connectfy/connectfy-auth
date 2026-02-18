import {
  BaseRemoveAllDto,
  BaseRemoveDto,
  FieldValidator,
  FIELD_TYPE,
  LANGUAGE,
} from 'connectfy-shared';

export class RemoveTokenDto extends BaseRemoveDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: LANGUAGE,
  })
  _lang?: LANGUAGE;
}

export class RemoveAllTokensDto extends BaseRemoveAllDto {}
