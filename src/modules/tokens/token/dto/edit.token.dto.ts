import { PartialType } from '@nestjs/mapped-types';
import { BaseTokenDto } from './base.token.dto';
import { FieldValidator, FIELD_TYPE } from 'connectfy-shared';

export class UpdateTokenDto extends PartialType(BaseTokenDto) {
  @FieldValidator({
    type: FIELD_TYPE.UUID,
  })
  _id: string;

  @FieldValidator({
    type: FIELD_TYPE.BOOLEAN,
    isOptional: true,
  })
  isUsed?: boolean;
}
