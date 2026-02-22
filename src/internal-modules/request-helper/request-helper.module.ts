import { Module } from '@nestjs/common';
import { RequestHelperService } from './request-helper.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RequestHelperService],
  exports: [RequestHelperService],
})
export class InternalRequestHelperModule {}
