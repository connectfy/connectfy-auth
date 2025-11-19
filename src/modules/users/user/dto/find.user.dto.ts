import { LANGUAGE } from '@/src/common/constants/common.enum';
import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { BaseFindDto } from '@common/dto/base.find.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class FindUserDto extends BaseFindDto {
  @IsOptional()
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.values(LANGUAGE)),
  })
  _lang?: LANGUAGE;

  @IsOptional()
  _loggedUser?: any;
}
