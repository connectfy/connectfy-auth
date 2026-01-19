import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_NAMES } from '@common/constants/constants';
import { AccountService } from './account.service';

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
    ]),
  ],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
