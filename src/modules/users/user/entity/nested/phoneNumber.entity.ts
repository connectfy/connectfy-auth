import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IPhoneNumber } from '../../interface/phoneNumber.interface';

@Schema({ _id: false, timestamps: false })
export class PhoneNumberModel implements IPhoneNumber {
  @Prop({ type: String, required: false, default: null, unique: false })
  countryCode: string;

  @Prop({ type: String, required: false, default: null, unique: false })
  number: string;

  @Prop({ type: String, required: false, default: null, unique: false })
  fullPhoneNumber: string;
}

export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumberModel);
export type PhoneNumberDocument = PhoneNumberModel & Document;
