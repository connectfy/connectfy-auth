import { FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class LogoutDto {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
    uuidVersion: '4',
  })
  deviceId: string;
}
