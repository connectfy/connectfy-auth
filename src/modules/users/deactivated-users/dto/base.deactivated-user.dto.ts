import { FieldValidator, FIELD_TYPE } from 'connectfy-shared';

export class BaseDeactivatedUserDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;
}
