import { Module } from '@nestjs/common';
import { DeactivatedUsersService } from './deactivated-users.service';
import { DeactivatedUsersController } from './deactivated-users.controller';
import { DeactivatedUserRepository } from './repo/deactivated-user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { DeactivatedUserSchema } from './entity/deactivated-user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DeactivatedUser', schema: DeactivatedUserSchema },
    ]),
  ],
  controllers: [DeactivatedUsersController],
  providers: [DeactivatedUsersService, DeactivatedUserRepository],
  exports: [DeactivatedUsersService, DeactivatedUserRepository],
})
export class DeactivetedUsersModule {}
