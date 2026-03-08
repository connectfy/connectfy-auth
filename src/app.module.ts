import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsInterceptor, ClsModule } from 'nestjs-cls';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggedUserInterceptor } from './interceptors/logged-user.interceptor';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { ExternalModulesModule } from './external-modules/external-modules.module';
import { InternalModulesModule } from './internal-modules/internal-modules.module';
import { ModulesModule } from './modules/modules.module';
import { ENVIRONMENT_VARIABLES } from './common/constants/environment-variables';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    MongooseModule.forRoot(ENVIRONMENT_VARIABLES.MONGO_URI, {
      dbName: ENVIRONMENT_VARIABLES.DB_NAME,
    }),

    TypeOrmModule.forRoot({
      type: ENVIRONMENT_VARIABLES.DB_TYPE as any,
      url: ENVIRONMENT_VARIABLES.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: ENVIRONMENT_VARIABLES.NODE_ENV === 'development',
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
