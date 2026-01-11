import { BaseUserDto } from './base.user.dto';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ValidationMessages } from '@common/constants/validation.messages';
import {
  arrayTransform,
  enumTransform,
  objectTransform,
  stringTransform,
} from '@/src/common/functions/transform';
import { PhoneNumberDto } from './nested/phoneNumber.dto';
import { USER_STATUS } from '@/src/common/enums/enums';

export class EditUserDto extends PartialType(BaseUserDto) {
  @Transform(({ key, value }) => stringTransform({ key, value }))
  @IsUUID('4', { message: ValidationMessages.UUID('_id') })
  @IsString({ message: ValidationMessages.STRING('_id') })
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('_id') })
  _id: string;

  @Transform(({ key, value }) => arrayTransform({ key, value }))
  @IsOptional()
  @IsArray({ message: ValidationMessages.ARRAY('faceDescriptor') })
  @IsNumber(
    { allowNaN: false },
    { message: ValidationMessages.NUMBER('faceDescriptor') },
  )
  faceDescriptor?: string | null;

  @Transform(({ key, value }) => objectTransform({ key, value }))
  @IsOptional()
  @ValidateNested()
  @Type(() => PhoneNumberDto)
  @IsNotEmpty({ message: ValidationMessages.REQUIRED('phoneNumber') })
  phoneNumber?: PhoneNumberDto | null;

  @Transform(({ key, value }) =>
    enumTransform({ key, value, enumObject: USER_STATUS }),
  )
  @IsOptional()
  @IsEnum(USER_STATUS, {
    message: ValidationMessages.ENUM('status', Object.keys(USER_STATUS)),
  })
  status?: USER_STATUS;
}
