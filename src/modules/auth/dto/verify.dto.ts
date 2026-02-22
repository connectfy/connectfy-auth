import { FIELD_TYPE, VALIDATION_TYPE, FieldValidator } from 'connectfy-shared';
import { SignupDto } from './signup.dto';
import { IRequestData } from '@/src/internal-modules/request-helper/interfaces/request.interface';
import { RequestDataDto } from '@/src/internal-modules/request-helper/dto/request-data.dto';

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
