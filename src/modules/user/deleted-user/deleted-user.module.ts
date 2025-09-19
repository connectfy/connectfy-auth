import { Module } from '@nestjs/common';
import { DeletedUserService } from './deleted-user.service';
import { DeletedUserController } from './deleted-user.controller';

@Module({
  controllers: [DeletedUserController],
  providers: [DeletedUserService],
})
export class DeletedUserModule {}
