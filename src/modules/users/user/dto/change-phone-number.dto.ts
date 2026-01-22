import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';
import { PHONE_NUMBER_ACTION } from '@/src/common/enums/enums';
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
  phoneNumber: PhoneNumberDto;
}
