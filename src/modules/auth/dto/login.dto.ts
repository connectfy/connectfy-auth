import { FIELD_TYPE, FieldValidator, IDENTIFIER_TYPE } from 'connectfy-shared';

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
