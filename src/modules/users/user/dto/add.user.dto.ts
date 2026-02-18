import { BaseUserDto } from './base.user.dto';
import { FIELD_TYPE, PROVIDER, FieldValidator } from 'connectfy-shared';

export class AddUserDto extends BaseUserDto {
  @FieldValidator({
    type: FIELD_TYPE.ENUM,
    enumObject: PROVIDER,
  })
  provider: PROVIDER;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  timeZone: string | null;

  @FieldValidator({
    type: FIELD_TYPE.STRING,
    isOptional: true,
  })
  location: string | null;
}
