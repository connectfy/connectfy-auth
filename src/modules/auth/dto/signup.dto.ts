import { IRequestData } from '@/src/internal-modules/request-helper/interfaces/request.interface';
import { RequestDataDto } from '@/src/internal-modules/request-helper/dto/request-data.dto';
import {
  FIELD_TYPE,
  VALIDATION_TYPE,
  FieldValidator,
  GENDER,
  THEME,
} from 'connectfy-shared';

export class SignupDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 50,
  })
  firstName: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 50,
  })
  lastName: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 3,
    maxLength: 30,
    matches: {
      regexp: /^[^\s.,?()$:;"'{}\[\]=+&!\\|/<>`~@#№%^]+$/,
      message: {
        type: VALIDATION_TYPE.MISMATCH,
        params: { characters: '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)' },
      },
    },
  })
  username: string;

  @FieldValidator({
    type: FIELD_TYPE.EMAIL,
    maxLength: 254,
  })
  email: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 8,
    maxLength: 30,
    matches: {
      regexp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,30}$/,
      message: {
        type: VALIDATION_TYPE.PASSWORD,
      },
    },
  })
  password: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: GENDER,
  })
  gender: GENDER;

  @FieldValidator({
    type: FIELD_TYPE.DATE,
  })
  birthdayDate: Date;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: THEME,
  })
  theme: THEME;
}

export class GoogleAuthSignupDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 2048,
  })
  idToken: string;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    minLength: 3,
    maxLength: 30,
    matches: {
      regexp: /^[^\s.,?()$:;"'{}\[\]=+&!\\|/<>`~@#№%^]+$/,
      message: {
        type: VALIDATION_TYPE.MISMATCH,
        params: { characters: '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)' },
      },
    },
  })
  username: string;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: GENDER,
  })
  gender: GENDER;

  @FieldValidator({
    type: FIELD_TYPE.DATE,
  })
  birthdayDate: Date;

  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: THEME,
  })
  theme: THEME;

  @FieldValidator({
    type: FIELD_TYPE.UUID,
    uuidVersion: '4',
  })
  deviceId: string;

  @FieldValidator({
    type: FIELD_TYPE.OBJECT,
    classType: RequestDataDto,
  })
  requestData: IRequestData;
}
