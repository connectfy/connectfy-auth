import { Global, Module } from '@nestjs/common';
import { TcpConnectionModule } from './tcp-connections/tcp-connection.module';
import { KafkaConnectionModule } from './kafka-connections/kafka-connection.module';

@Global()
@Module({
  imports: [TcpConnectionModule, KafkaConnectionModule],
  controllers: [],
  providers: [],
  exports: [TcpConnectionModule, KafkaConnectionModule],
})
export class AppSettingsModule {}
