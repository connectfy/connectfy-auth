import { FieldValidator, FIELD_TYPE } from 'connectfy-shared';

export class BaseBannedUserDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  userId: string;

  @FieldValidator({
    type: FIELD_TYPE.DATE,
  })
  bannedToDate: Date;
}
