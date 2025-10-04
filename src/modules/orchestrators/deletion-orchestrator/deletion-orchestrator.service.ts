import { ClientKafka } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { DeletionOrchestorRepository } from './repo/deletion-orchestor.repo';
import { accountDeletedMessage } from '@common/constants/emial.messages';
import { LANGUAGE } from '@common/constants/common.enum';
import i18n from '@/src/i18n';

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

  async markCompleted(deletionToken: string, part: string, _lang: LANGUAGE) {
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
        subject: i18n.t("email_messages.delete_account_completed.mail_subject", { lang: _lang }),
        html: accountDeletedMessage(deletionToken, _lang),
      });
    }
  }
}
