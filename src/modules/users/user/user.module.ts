import { forwardRef, Module } from '@nestjs/common';
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
import { DeactivatedUsersModule } from '../deactivated-users/deactivated-users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COLLECTIONS.AUTH.USER.USERS, schema: UserSchema },
    ]),
    TokenModule,
    JwtModule,
    RefreshTokenModule,
    forwardRef(() => DeletedUserModule),
    forwardRef(() => DeactivatedUsersModule),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
