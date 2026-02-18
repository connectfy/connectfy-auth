import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannedUserService } from './banned-user.service';
import { BannedUserSchema } from './entity/banned-user.entity';
import { BannedUserController } from './banned-user.controller';
import { BannedUserRepository } from './repo/banned-user.repo';
import { COLLECTIONS } from 'connectfy-shared';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COLLECTIONS.AUTH.USER.BANNED, schema: BannedUserSchema },
    ]),
  ],
  controllers: [BannedUserController],
  providers: [BannedUserService, BannedUserRepository],
  exports: [BannedUserService, BannedUserRepository],
})
export class BannedUserModule {}
