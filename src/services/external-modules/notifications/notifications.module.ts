import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from '@common/constants/constants';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.NOTIFICATION.KAFKA,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'connectfy-notification',
            brokers: ['kafka-0:9092', 'kafka-1:9092'],
          },
          consumer: {
            groupId: 'consumer-connectfy-notification',
            allowAutoTopicCreation: false,
          },
          run: {
            autoCommit: false,
          },
        },
      },
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
