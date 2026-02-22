import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entity/user.entity';
import { UserRepository } from './repo/user.repo';
import { DeletedUserModule } from '../deleted-user/deleted-user.module';
import { TokenModule } from '../../tokens/token/token.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenModule } from '../../tokens/refresh-token/refresh-token.module';
import { COLLECTIONS } from 'connectfy-shared';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COLLECTIONS.AUTH.USER.USERS, schema: UserSchema },
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
