import { ValidationMessages } from "@/src/common/constants/validation.messages";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyAccount {
    @IsString({ message: ValidationMessages.STRING('verifyCode') })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty({ message: ValidationMessages.REQUIRED('verifyCode') })
    verifyCode: string;
}