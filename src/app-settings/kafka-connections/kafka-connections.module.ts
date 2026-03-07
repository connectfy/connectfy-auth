import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from 'connectfy-shared';

@Module({
  imports: [
    ClientsModule.register({
      clients: [
        {
          name: MICROSERVICE_NAMES.NOTIFICATION.KAFKA,
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'connectfy-notification-action-history',
              brokers: ['kafka-0:9092', 'kafka-1:9092'],
            },
            consumer: {
              groupId: 'consumer-connectfy-notification-action-history',
              allowAutoTopicCreation: false,
            },
            run: {
              autoCommit: false,
            },
          },
        },
      ],
      isGlobal: true,
    }),
  ],
})
export class KafkaConnectionsModule {}
