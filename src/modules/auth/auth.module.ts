import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../tokens/refresh-token/refresh-token.module';
import { UserModule } from '../users/user/user.module';
import { DeletedUserModule } from '../users/deleted-user/deleted-user.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BannedUserModule } from '../users/banned-user/banned-user.module';
import { TokenModule } from '../tokens/token/token.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ACCOUNT_SETTINGS_TCP',
        transport: Transport.TCP,
        options: {
          host: 'account-service',
          port: 5000,
        },
      },
      {
        name: 'NOTIFICATION_SERVICE_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'notification-action-history',
            brokers: ['kafka-0:9092', 'kafka-1:9092'],
          },
          consumer: {
            groupId: 'consumer-notification-action-history',
            allowAutoTopicCreation: false,
          },
          run: {
            autoCommit: false,
          },
        },
      },
    ]),
    UsersModule,
    RefreshTokenModule,
    JwtModule,
    UserModule,
    DeletedUserModule,
    BannedUserModule,
    TokenModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, RefreshTokenModule, UsersModule],
})
export class AuthModule {}
