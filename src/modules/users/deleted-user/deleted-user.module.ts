import { Module } from '@nestjs/common';
import { DeletedUserService } from './deleted-user.service';
import { DeletedUserController } from './deleted-user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeletedUserSchema } from './entity/deleted-user.entity';
import { DeletedUserRepository } from './repo/deleted-user.repo';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DeletedUser', schema: DeletedUserSchema },
    ]),
  ],
  controllers: [DeletedUserController],
  providers: [DeletedUserService, DeletedUserRepository],
  exports: [DeletedUserService, DeletedUserRepository],
})
export class DeletedUserModule {}
