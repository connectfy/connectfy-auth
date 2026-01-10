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
import { DeactivetedUsersModule } from '../users/deactivated-users/deactivated-users.module';
import { EmailService } from '@/src/common/services/utils/email.service';
import { BcryptService } from '@/src/common/services/utils/bcrypt.service';
import { MICROSERVICE_NAMES } from '@/src/common/constants/constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_NAMES.ACCOUNT.TCP,
        transport: Transport.TCP,
        options: {
          host: 'account-service',
          port: 5000,
        },
      },
      // {
      //   name: MICROSERVICE_NAMES.ACCOUNT.KAFKA,
      //   transport: Transport.KAFKA,
      //   options: {
      //     client: {
      //       clientId: 'connectfy-account',
      //       brokers: ['kafka-0:9092', 'kafka-1:9092'],
      //     },
      //     consumer: {
      //       groupId: 'consumer-connectfy-account',
      //       allowAutoTopicCreation: false,
      //     },
      //     run: {
      //       autoCommit: false,
      //     },
      //   },
      // },
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
      // {
      //   name: MICROSERVICE_NAMES.RELATIONSHIP.KAFKA
      //   transport: Transport.KAFKA,
      //   options: {
      //     client: {
      //       clientId: 'connectfy-relationship',
      //       brokers: ['kafka-0:9092', 'kafka-1:9092'],
      //     },
      //     consumer: {
      //       groupId: 'consumer-connectfy-relationship',
      //       allowAutoTopicCreation: false,
      //     },
      //     run: {
      //       autoCommit: false,
      //     },
      //   },
      // },
    ]),
    UsersModule,
    RefreshTokenModule,
    JwtModule,
    UserModule,
    DeletedUserModule,
    BannedUserModule,
    TokenModule,
    DeactivetedUsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, BcryptService],
})
export class AuthModule {}
