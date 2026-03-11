import { RequestDataDto } from '@/src/internal-modules/request-helper/dto/request-data.dto';
import { IRequestData } from '@/src/internal-modules/request-helper/interfaces/request.interface';
import { FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class RestoreAccountDto {
  @FieldValidator({
    type: FIELD_TYPE.STRING,
    maxLength: 1000,
  })
  token: string;

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
