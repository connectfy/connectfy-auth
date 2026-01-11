import { LANGUAGE } from '@/src/common/enums/enums';
import { ValidationMessages } from '@common/constants/validation.messages';
import { BaseFindDto } from '@common/dto/base.find.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class FindTokenDto extends BaseFindDto {
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
