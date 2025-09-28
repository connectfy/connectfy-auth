import { Controller } from '@nestjs/common';
import { DeletionOrchestratorService } from './deletion-orchestrator.service';
import { EventPattern, Payload, Transport } from '@nestjs/microservices';

@Controller('deletion-orchestrator')
export class DeletionOrchestratorController {
  constructor(private readonly service: DeletionOrchestratorService) {}

  @EventPattern('auth.account.deleteAccount.completed', Transport.KAFKA)
  async onAccountCompleted(
    @Payload() data: { userId: string; deletionToken: string },
  ) {
    await this.service.markCompleted(data.deletionToken, 'account');
  }

  @EventPattern('auth.account.deleteSocialLink.completed', Transport.KAFKA)
  async onSocialLinksCompleted(
    @Payload() data: { userId: string; deletionToken: string },
  ) {
    await this.service.markCompleted(data.deletionToken, 'socialLinks');
  }

  @EventPattern('auth.account.deletePrivacySetting.completed', Transport.KAFKA)
  async onPrivacyCompleted(
    @Payload() data: { userId: string; deletionToken: string },
  ) {
    await this.service.markCompleted(data.deletionToken, 'privacySettings');
  }

  @EventPattern('auth.relationship.deleteFriendship.completed', Transport.KAFKA)
  async onFriendshipsCompleted(
    @Payload() data: { userId: string; deletionToken: string },
  ) {
    await this.service.markCompleted(data.deletionToken, 'friendships');
  }

  @EventPattern('auth.relationship.deleteBlocklist.completed', Transport.KAFKA)
  async onBlocklistCompleted(
    @Payload() data: { userId: string; deletionToken: string },
  ) {
    await this.service.markCompleted(data.deletionToken, 'blocklist');
  }
}
