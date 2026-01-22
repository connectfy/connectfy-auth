import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE, VALIDATION_TYPE } from '@common/enums/enums';
import { SignupDto } from './signup.dto';
import { LANGUAGE } from '@/src/common/enums/enums';

export class VerifySignupDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 6,
    maxLength: 6,
    matches: {
      regexp: /^\d+$/,
      message: {
        type: VALIDATION_TYPE.NUMBER,
      },
    },
  })
  code: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  verifyCode: string;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    classType: SignupDto,
    validateNested: {},
  })
  unverifiedUser: SignupDto;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
  })
  _lang: LANGUAGE;

  @FieldValidator({
    type: FIELD_TYPE.UUID,
    uuidVersion: '4',
  })
  deviceId: string;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    isOptional: true,
  })
  requestData: {
    headers: {
      'user-agent'?: string | string[];
      'x-forwarded-for'?: string | string[];
      'x-real-ip'?: string | string[];
      'cf-connecting-ip'?: string | string[];
    };
    ip?: string;
  };
}
