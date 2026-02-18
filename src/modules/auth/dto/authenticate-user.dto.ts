import { FIELD_TYPE, TOKEN_TYPE, FieldValidator } from 'connectfy-shared';

export class AuthenticateUserDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
    validateIf: (obj) => obj.password || obj.type !== TOKEN_TYPE.CHANGE_EMAIL,
  })
  password: string | null;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: {
      DELETE_ACCOUNT: TOKEN_TYPE.DELETE_ACCOUNT,
      RESTORE_ACCOUNT: TOKEN_TYPE.RESTORE_ACCOUNT,
      CHANGE_USERNAME: TOKEN_TYPE.CHANGE_USERNAME,
      CHANGE_EMAIL: TOKEN_TYPE.CHANGE_EMAIL,
      CHANGE_PASSWORD: TOKEN_TYPE.CHANGE_PASSWORD,
      CHANGE_PHONE_NUMBER: TOKEN_TYPE.CHANGE_PHONE_NUMBER,
      DEACTIVATE_ACCOUNT: TOKEN_TYPE.DEACTIVATE_ACCOUNT,
    },
  })
  type: TOKEN_TYPE;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
    maxLength: 1000,
    validateIf: (obj) => obj.idToken,
  })
  idToken: string | null;
}
