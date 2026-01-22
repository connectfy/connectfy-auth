import {
  FIELD_TYPE,
  IDENTIFIER_TYPE,
  LANGUAGE,
} from '@/src/common/enums/enums';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';

export class LoginDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: IDENTIFIER_TYPE,
  })
  identifierType: IDENTIFIER_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  identifier: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  password: string;

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

export class GoogleAuthLoginDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
  })
  idToken: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: LANGUAGE,
    enumValues: Object.values(LANGUAGE),
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
