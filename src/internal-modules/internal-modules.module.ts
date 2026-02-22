import { Global, Module } from '@nestjs/common';
import { InternalBcryptModule } from './bcrypt/bcrypt.module';

@Global()
@Module({
  imports: [InternalBcryptModule],
  controllers: [],
  providers: [],
  exports: [InternalBcryptModule],
})
export class InternalModulesModule {}
