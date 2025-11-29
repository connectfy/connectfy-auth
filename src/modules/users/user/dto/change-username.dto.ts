import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ChangeUsernameDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: ValidationMessages.MISMATCH(
      'username',
      '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)',
    ),
  })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  username: string;
}
