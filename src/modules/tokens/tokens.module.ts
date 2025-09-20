import { Module } from '@nestjs/common';
import { TokenModule } from './token/token.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';

@Module({
  imports: [TokenModule, RefreshTokenModule],
})
export class TokensModule {}
