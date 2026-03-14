import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BannedUserModule } from './banned-user/banned-user.module';
import { DeletedUserModule } from './deleted-user/deleted-user.module';
import { DeactivatedUsersModule } from './deactivated-users/deactivated-users.module';

@Module({
  imports: [
    UserModule,
    BannedUserModule,
    DeletedUserModule,
    DeactivatedUsersModule,
  ],
})
export class UsersModule {}
