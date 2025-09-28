import { ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { DeletionOrchestorRepository } from './repo/deletion-orchestor.repo';
import { accountDeletedMessage } from '@common/constants/emial.messages';

@Injectable()
export class DeletionOrchestratorService {
  constructor(
    @Inject('NOTIFICATION_SERVICE_KAFKA')
    private readonly notificationServiceKafka: ClientKafka,

    private readonly deletionRequestRepo: DeletionOrchestorRepository,
  ) {}

  async onModuleInit() {
    await this.notificationServiceKafka.connect();
  }

  async markCompleted(deletionToken: string, part: string) {
    const updated = await this.deletionRequestRepo.markPartCompleted(
      deletionToken,
      part,
    );
    if (!updated) return;

    const req = await this.deletionRequestRepo.findOneByToken(deletionToken);
    if (!req) return;

    const allDone = Object.values(req.parts).every(Boolean);

    if (allDone && !req.emailSent) {
      await this.deletionRequestRepo.markEmailSent(deletionToken);

      //   emit mail event
      this.notificationServiceKafka.emit('mail.send', {
        from: '"Connectfy Team" <connectfy.team@gmail.com>',
        sender: 'Connectfy Team',
        to: req.email,
        subject: 'Account Deletion Completed',
        html: accountDeletedMessage(deletionToken),
      });
    }
  }
}
