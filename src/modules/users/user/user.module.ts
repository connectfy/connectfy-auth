import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entity/user.entity';
import { UserRepository } from './repo/user.repo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DeletedUserModule } from '../deleted-user/deleted-user.module';
import { TokenModule } from '../../tokens/token/token.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenModule } from '../../tokens/refresh-token/refresh-token.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    ClientsModule.register([
      {
        name: 'ACCOUNT_SERVICE_TCP',
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
    DeletedUserModule,
    TokenModule,
    JwtModule,
    RefreshTokenModule,
    DeletedUserModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
