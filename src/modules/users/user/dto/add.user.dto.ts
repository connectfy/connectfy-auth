import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseUserDto } from './base.user.dto';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { PROVIDER } from '@common/constants/common.enum';

export class AddUserDto extends BaseUserDto {
  @IsEnum(PROVIDER, {
    message: ValidationMessages.ENUM('provider', Object.keys(PROVIDER)),
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('provider') })
  provider: PROVIDER;
}
