import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshTokenModule } from '../tokens/refresh-token/refresh-token.module';
import { UserModule } from '../users/user/user.module';
import { DeletedUserModule } from '../users/deleted-user/deleted-user.module';

@Module({
  imports: [
    UsersModule,
    RefreshTokenModule,
    JwtModule,
    UserModule,
    DeletedUserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, RefreshTokenModule, UsersModule],
})
export class AuthModule {}
