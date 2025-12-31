import { ValidationMessages } from '@/src/common/constants/validation.messages';
import { stringTransform } from '@/src/common/functions/transform';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class ChangeUsernameDto {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('username') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('username') })
  @MinLength(3, { message: ValidationMessages.MIN('username', 3) })
  @MaxLength(30, { message: ValidationMessages.MAX('username', 30) })
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: ValidationMessages.MISMATCH(
      'username',
      '(.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^)',
    ),
  })
  username: string;

  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsString({ message: ValidationMessages.STRING('token') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('token') })
  @MaxLength(1000, { message: ValidationMessages.MAX('token', 1000) })
  token: string;
}