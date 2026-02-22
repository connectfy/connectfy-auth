import { Global, Module } from '@nestjs/common';
import { InternalBcryptModule } from './bcrypt/bcrypt.module';
import { InternalRequestHelperModule } from './request-helper/request-helper.module';

@Global()
@Module({
  imports: [InternalBcryptModule, InternalRequestHelperModule],
  controllers: [],
  providers: [],
  exports: [InternalBcryptModule, InternalRequestHelperModule],
})
export class InternalModulesModule {}
