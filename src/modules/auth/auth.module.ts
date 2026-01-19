import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../tokens/refresh-token/refresh-token.module';
import { UserModule } from '../users/user/user.module';
import { DeletedUserModule } from '../users/deleted-user/deleted-user.module';
import { BannedUserModule } from '../users/banned-user/banned-user.module';
import { TokenModule } from '../tokens/token/token.module';
import { DeactivetedUsersModule } from '../users/deactivated-users/deactivated-users.module';
import { NotificationsModule } from '@/src/services/external-modules/notifications/notifications.module';
import { BcryptModule } from '@/src/services/app-modules/bcrypt/bcrypt.module';
import { AccountModule } from '@/src/services/external-modules/account/account.module';

@Module({
  imports: [
    UsersModule,
    RefreshTokenModule,
    JwtModule,
    UserModule,
    DeletedUserModule,
    BannedUserModule,
    TokenModule,
    DeactivetedUsersModule,
    AccountModule,
    NotificationsModule,
    BcryptModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
