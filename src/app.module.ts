import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsInterceptor, ClsModule } from 'nestjs-cls';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggedUserInterceptor } from './interceptors/logged-user.interceptor';
import { ENV } from 'connectfy-shared';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { ExternalModulesModule } from './external-modules/external-modules.module';
import { InternalModulesModule } from './internal-modules/internal-modules.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(ENV.CORE.DATABASE.MONGO.URI),
        dbName: config.get<string>(ENV.CORE.DATABASE.MONGO.DB_NAME),
      }),
    }),
    ClsModule.forRoot({
      global: true,
      interceptor: { mount: false },
    }),

    // /src/app-settings
    AppSettingsModule,
    // /src/external-modules
    ExternalModulesModule,
    // /src/internal-modules
    InternalModulesModule,
    // /src/modules
    ModulesModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggedUserInterceptor },
  ],
})
export class AppModule {}
