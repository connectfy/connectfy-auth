import { PartialType } from '@nestjs/mapped-types';
import { BaseTokenDto } from './base.token.dto';
import { FieldValidator } from '@common/decorators/field-validator/field-validator.decorator';
import { FIELD_TYPE } from '@common/enums/enums';

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
