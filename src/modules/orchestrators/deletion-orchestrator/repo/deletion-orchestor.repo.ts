import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AddDeletionOrchestorDto } from '../dto/add.deletion-orchestor.dto';
import { DeletionOrchestorDocument } from '../entity/deletion-orchestor.entity';

export class DeletionOrchestorRepository {
  constructor(
    @InjectModel('DeletionOrchestor')
    private readonly model: Model<DeletionOrchestorDocument>,
  ) {}

  async create(data: AddDeletionOrchestorDto) {
    return await this.model.create(data);
  }

  async findOneByToken(token: string) {
    return await this.model.findOne({ deletionToken: token }).exec();
  }

  async markPartCompleted(token: string, part: string) {
    return await this.model
      .findOneAndUpdate(
        { deletionToken: token, [`parts.${part}`]: { $ne: true } },
        { $set: { [`parts.${part}`]: true } },
        { new: true },
      )
      .exec();
  }

  async markEmailSent(token: string) {
    return await this.model
      .findOneAndUpdate(
        { deletionToken: token },
        { $set: { emailSent: true } },
        { new: true },
      )
      .exec();
  }
}
