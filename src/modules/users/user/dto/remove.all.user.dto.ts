import { ValidationMessages } from '@common/constants/validation.messages';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class RemoveAllUsersDto {
  @IsArray({ message: ValidationMessages.ARRAY('_ids') })
  @ArrayNotEmpty({ message: ValidationMessages.REQUIRED('_ids') })
  @IsString({ each: true, message: ValidationMessages.STRING('_ids[*]') })
  _ids: string[];
}
