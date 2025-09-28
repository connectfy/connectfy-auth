import { v4 as uuid } from 'uuid';
import { Document } from 'mongoose';
import {
  IDeletionOrchestor,
  IDeletionOrchestorPart,
} from '../interface/deletion-orchestor.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ITimestamps } from '@common/interfaces/date.interface';

@Schema({ timestamps: false, collection: 'deletion_orchestors' })
export class DeletionOrchestorModel implements IDeletionOrchestor {
  @Prop({ type: String, default: () => uuid() })
  _id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  deletionToken: string;

  @Prop({
    type: Object,
    default: {
      account: false,
      socialLinks: false,
      privacySettings: false,
      friendships: false,
      blocklist: false,
      // notifications: false,
    },
  })
  parts: IDeletionOrchestorPart;

  @Prop({ type: Boolean, default: false })
  emailSent: boolean;
}

export const DeletionOrchestorSchema = SchemaFactory.createForClass(
  DeletionOrchestorModel,
);
export type DeletionOrchestorDocument = DeletionOrchestorModel &
  Document &
  ITimestamps;
