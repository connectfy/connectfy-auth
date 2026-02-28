import {
  FieldValidator,
  FIELD_TYPE,
  PHONE_NUMBER_ACTION,
} from 'connectfy-shared';
import { PhoneNumberDto } from './nested/phoneNumber.dto';

export class ChangePhoneNumberDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  token: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: PHONE_NUMBER_ACTION,
  })
  action: PHONE_NUMBER_ACTION;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    isOptional: true,
    validateIf: (obj) => obj.action === PHONE_NUMBER_ACTION.UPDATE,
    validateNested: {},
    classType: PhoneNumberDto,
  })
  phoneNumber: PhoneNumberDto | null;
}
