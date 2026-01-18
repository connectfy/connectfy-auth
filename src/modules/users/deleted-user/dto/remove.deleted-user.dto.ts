import { enumTransform } from '@/src/common/functions/transform';
import { LANGUAGE } from '@/src/common/enums/enums';
import { ValidationMessages } from '@common/constants/validation.messages';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseRemoveDto } from '@common/dto/base.remove.dto';

export class RemoveDeletedUserDto extends BaseRemoveDto {
  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: LANGUAGE }),
  )
  @IsEnum(LANGUAGE, {
    message: ValidationMessages.ENUM('_lang', Object.keys(LANGUAGE)),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_lang') })
  _lang?: LANGUAGE;
}
