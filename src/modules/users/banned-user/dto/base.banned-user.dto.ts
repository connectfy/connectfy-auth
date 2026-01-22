import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';

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
