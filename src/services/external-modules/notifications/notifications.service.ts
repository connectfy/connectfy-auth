import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import i18n from '@/src/i18n';
import { ISendEmail } from './interfaces/notifications.interface';
import {
  accountDeletedMessage,
  emailNotFoundMessage,
  forgotPasswordMessage,
  googleSignInMessage,
  signupVerifyMessage,
  changeEmailMessage,
  MICROSERVICE_NAMES,
  emitWithContext,
} from 'connectfy-shared';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(MICROSERVICE_NAMES.NOTIFICATION.KAFKA)
    private readonly notificationServiceKafka: ClientKafka,
  ) {}

  // =================================
  // EMAIL SENDER
  // =================================
  private sendEmail(to: string, subject: string, html: string): void {
    emitWithContext({
      client: this.notificationServiceKafka,
      topic: 'mail.send',
      payload: {
        from: '"Connectfy Team" <connectfy.team@gmail.com>',
        sender: 'Connectfy Team',
        to,
        subject,
        html,
      },
    });
  }

  // =================================
  // SIGNUP VERIFY MESSAGE
  // =================================
  verifySignup(data: ISendEmail): void {
    const { to, _lang: lang, additional } = data;
    const { firstName, lastName, verifyCode } = additional!;
    this.sendEmail(
      to,
      i18n.t('email_messages.signup_verify.mail_subject', { lang }),
      signupVerifyMessage(firstName, lastName, verifyCode, lang),
    );
  }

  // =================================
  // EMAIL NOT FOUND FOR RESET PASSWORD
  // =================================
  emailNotFound(data: ISendEmail): void {
    const { to, _lang: lang } = data;
    this.sendEmail(
      to,
      i18n.t('email_messages.email_not_found.mail_subject', { lang }),
      emailNotFoundMessage(to, lang),
    );
  }

  // =================================
  // GOOGLE PROVIDER DETECETED FOR RESET PASSWORD
  // =================================
  googleSignInDetected(data: ISendEmail): void {
    const { to, _lang: lang } = data;
    this.sendEmail(
      to,
      i18n.t('email_messages.google_sign_in.mail_subject', { lang }),
      googleSignInMessage(to, lang),
    );
  }

  // =================================
  // FORGOT PASSWORD EMAIL TO RESET PASSWORD
  // =================================
  forgotPassword(data: ISendEmail): void {
    const { to, _lang: lang, additional } = data;
    const { token } = additional!;
    this.sendEmail(
      to,
      i18n.t('email_messages.forgot_password.mail_subject', { lang }),
      forgotPasswordMessage(token, lang),
    );
  }

  // =================================
  // RESTORE ACCOUNT EMAIL AFTER DELETE
  // =================================
  deleteAccountCompleted(data: ISendEmail): void {
    const { to, _lang: lang, additional } = data;
    const { token } = additional!;
    this.sendEmail(
      to,
      i18n.t('email_messages.delete_account_completed.mail_subject', { lang }),
      accountDeletedMessage(token, lang),
    );
  }

  // =================================
  // MESSAGE FOR CHANGE EMAIL
  // =================================
  changeEmail(data: ISendEmail): void {
    const { to, _lang: lang, additional } = data;
    const { token } = additional!;
    this.sendEmail(
      to,
      i18n.t('email_messages.change_email.mail_subject', { lang }),
      changeEmailMessage(token, lang),
    );
  }
}
