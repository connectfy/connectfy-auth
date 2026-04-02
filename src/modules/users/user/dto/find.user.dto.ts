import { BaseFindDto, FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class FindUserDto extends BaseFindDto {}

export class FindUserByIdDto {
  @FieldValidator({ type: FIELD_TYPE.UUID })
  _id: string;
}
