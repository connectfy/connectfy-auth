import { Module } from '@nestjs/common';
import { BannedUserService } from './banned-user.service';
import { BannedUserController } from './banned-user.controller';

@Module({
  controllers: [BannedUserController],
  providers: [BannedUserService],
})
export class BannedUserModule {}
