import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseUserDto } from './base.user.dto';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { PROVIDER } from '@common/constants/common.enum';
import { enumTransform } from '@/src/common/functions/transform';

export class AddUserDto extends BaseUserDto {
  @Transform(({ key, value }) => enumTransform({ key, value, enumObject: PROVIDER }))
  @IsEnum(PROVIDER, {
    message: ValidationMessages.ENUM('provider', Object.keys(PROVIDER)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('provider') })
  provider: PROVIDER;
}
