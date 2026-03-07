import { ENVIRONMENT_VARIABLES } from '@/src/common/constants/environment-variables';
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from 'connectfy-shared';
import { KafkaConnectionService } from './kafka-connection.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.KAFKA,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: `${ENVIRONMENT_VARIABLES.SERVICE_NAME}-client`,
            brokers: [
              ENVIRONMENT_VARIABLES.BROKER1,
              ENVIRONMENT_VARIABLES.BROKER2,
            ].filter(Boolean),
          },
          consumer: {
            groupId: `${ENVIRONMENT_VARIABLES.SERVICE_NAME}-client-group`,
          },
        },
      },
    ]),
  ],
  providers: [KafkaConnectionService],
  exports: [KafkaConnectionService],
})
export class KafkaConnectionModule {}
