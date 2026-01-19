import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema } from './entity/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenRepository } from './repo/refresh-token.repo';
import { COLLECTIONS } from '@/src/common/constants/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: COLLECTIONS.AUTH.TOKEN.REFRESH_TOKENS,
        schema: RefreshTokenSchema,
      },
    ]),
    JwtModule,
  ],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService, RefreshTokenRepository],
})
export class RefreshTokenModule {}
