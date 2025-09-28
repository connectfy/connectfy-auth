import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeletionOrchestorSchema } from './entity/deletion-orchestor.entity';
import { DeletionOrchestorRepository } from './repo/deletion-orchestor.repo';
import { DeletionOrchestratorService } from './deletion-orchestrator.service';
import { DeletionOrchestratorController } from './deletion-orchestrator.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DeletionOrchestor', schema: DeletionOrchestorSchema },
    ]),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE_KAFKA',
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
  controllers: [DeletionOrchestratorController],
  providers: [DeletionOrchestratorService, DeletionOrchestorRepository],
  exports: [DeletionOrchestratorService, DeletionOrchestorRepository],
})
export class DeletionOrchestratorModule {}
