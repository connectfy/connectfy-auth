import { FIELD_TYPE, FieldValidator } from 'connectfy-shared';

export class RequestDataHeadersDto {
  @FieldValidator({ type: FIELD_TYPE.STRING })
  'user-agent': string;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  'x-forwarded-for': string;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  'x-real-ip': string;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  'cf-connecting-ip': string;
}

export class RequestDataDto {
  @FieldValidator({ type: FIELD_TYPE.OBJECT, classType: RequestDataHeadersDto })
  headers: RequestDataHeadersDto;

  @FieldValidator({ type: FIELD_TYPE.STRING })
  ip: string;
}
