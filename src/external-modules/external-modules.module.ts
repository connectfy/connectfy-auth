import { Global, Module } from '@nestjs/common';
import { ExternalAccountModule } from './account/account.module';
import { ExternalNotificationsModule } from './notifications/notifications.module';

@Global()
@Module({
  imports: [ExternalAccountModule, ExternalNotificationsModule],
  controllers: [],
  providers: [],
  exports: [ExternalAccountModule, ExternalNotificationsModule],
})
export class ExternalModulesModule {}
