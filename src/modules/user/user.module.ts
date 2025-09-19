import { Module } from '@nestjs/common';
import { UserModule as UsersModule } from './user/user.module';
import { BannedUserModule } from './banned-user/banned-user.module';
import { DeletedUserModule } from './deleted-user/deleted-user.module';

@Module({
  imports: [UsersModule, BannedUserModule, DeletedUserModule],
})
export class UserModule {}
