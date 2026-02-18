import {
  BaseFindDto,
  FieldValidator,
  FIELD_TYPE,
  LANGUAGE,
} from 'connectfy-shared';

export class FindTokenDto extends BaseFindDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    isOptional: true,
    enumObject: LANGUAGE,
  })
  _lang?: LANGUAGE;
}
