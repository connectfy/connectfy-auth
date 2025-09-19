import { IsString } from "class-validator";
import { ValidationMessages } from "../constants/validation.messages";

export class PopulateOption {
  @IsString({ message: ValidationMessages.STRING('populate.path') })
  path: string;

  @IsString({ message: ValidationMessages.STRING('populate.select') })
  select: string;
}