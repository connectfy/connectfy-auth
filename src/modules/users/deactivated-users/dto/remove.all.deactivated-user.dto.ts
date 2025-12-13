import { arrayTransform } from '@/src/common/functions/transform';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RemoveAllDeactivatedUsersDto {
  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsArray({ message: ValidationMessages.ARRAY('_ids') })
  @ArrayNotEmpty({ message: ValidationMessages.REQUIRED('_ids') })
  @IsString({ each: true, message: ValidationMessages.STRING('_ids[*]') })
  _ids: string[];
}
