import { BaseUserDto } from './base.user.dto';
import { PartialType } from '@nestjs/mapped-types';
import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { FIELD_TYPE, USER_STATUS, FieldValidator } from 'connectfy-shared';

export class EditUserDto extends PartialType(BaseUserDto) {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  _id: string;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    classType: PhoneNumberDto,
    isOptional: true,
  })
  phoneNumber?: PhoneNumberDto | null;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: USER_STATUS,
    isOptional: true,
  })
  status?: USER_STATUS;

  @FieldValidator({
    type: FIELD_TYPE.BOOLEAN,
    isOptional: true,
  })
  isTwoFactorEnabled?: boolean;
}
