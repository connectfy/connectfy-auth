import { Module } from '@nestjs/common';
import { DeletionOrchestratorModule } from './deletion-orchestrator/deletion-orchestrator.module';

@Module({
  imports: [DeletionOrchestratorModule],
})
export class OrchestratorsModule {}
