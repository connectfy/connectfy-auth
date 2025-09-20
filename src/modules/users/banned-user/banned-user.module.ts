import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannedUserService } from './banned-user.service';
import { BannedUserSchema } from './entity/banned-user.entity';
import { BannedUserController } from './banned-user.controller';
import { BannedUserRepository } from './repo/banned-user.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BannedUser', schema: BannedUserSchema },
    ]),
  ],
  controllers: [BannedUserController],
  providers: [BannedUserService, BannedUserRepository],
  exports: [BannedUserService, BannedUserRepository],
})
export class BannedUserModule {}
