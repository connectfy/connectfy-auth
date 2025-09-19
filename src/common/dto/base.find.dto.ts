import { Type } from "class-transformer";
import { IsArray, IsInt, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { ValidationMessages } from "../constants/validation.messages";
import { PopulateOption } from "./populate.option.dto";

export class BaseFindDto {
  @IsOptional()
  @IsInt({ message: ValidationMessages.INT('limit') })
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt({ message: ValidationMessages.INT('skip') })
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsObject({ message: ValidationMessages.STRING('sort') })
  sort?: Record<string, 1 | -1>;

  @IsOptional()
  @IsObject({ message: ValidationMessages.OBJECT('query') })
  query?: Record<string, any>;

  @IsOptional()
  @IsString({ message: ValidationMessages.STRING('fields') })
  fields?: string;

  @IsOptional()
  @IsArray({ message: ValidationMessages.ARRAY('populate') })
  @ValidateNested({ each: true })
  @Type(() => PopulateOption)
  populate?: PopulateOption[];
}
