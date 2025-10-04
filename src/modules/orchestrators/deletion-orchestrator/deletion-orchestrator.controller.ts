import { Controller } from '@nestjs/common';
import { DeletionOrchestratorService } from './deletion-orchestrator.service';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';
import { LANGUAGE } from '@common/constants/common.enum';

@Controller('deletion-orchestrator')
export class DeletionOrchestratorController {
  constructor(private readonly service: DeletionOrchestratorService) {}

  @EventPattern('auth.account.deleteAccount.completed', Transport.KAFKA)
  async onAccountCompleted(
    @Payload() data: { userId: string; deletionToken: string, _lang: LANGUAGE },
  ) {
    await this.service.markCompleted(data.deletionToken, 'account', data._lang);
  }

  @EventPattern('auth.account.deleteSocialLink.completed', Transport.KAFKA)
  async onSocialLinksCompleted(
    @Payload() data: { userId: string; deletionToken: string, _lang: LANGUAGE },
  ) {
    await this.service.markCompleted(data.deletionToken, 'socialLinks', data._lang);
  }

  @EventPattern('auth.account.deletePrivacySetting.completed', Transport.KAFKA)
  async onPrivacyCompleted(
    @Payload() data: { userId: string; deletionToken: string, _lang: LANGUAGE },
  ) {
    await this.service.markCompleted(data.deletionToken, 'privacySettings', data._lang);
  }

  @EventPattern('auth.relationship.deleteFriendship.completed', Transport.KAFKA)
  async onFriendshipsCompleted(
    @Payload() data: { userId: string; deletionToken: string, _lang: LANGUAGE },
  ) {
    await this.service.markCompleted(data.deletionToken, 'friendships', data._lang);
  }

  @EventPattern('auth.relationship.deleteBlocklist.completed', Transport.KAFKA)
  async onBlocklistCompleted(
    @Payload() data: { userId: string; deletionToken: string, _lang: LANGUAGE },
  ) {
    await this.service.markCompleted(data.deletionToken, 'blocklist', data._lang);
  }
}
