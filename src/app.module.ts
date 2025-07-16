import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule, AppConfigService } from './config';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [AppConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (ConfigService: AppConfigService) => ({
        throttlers: [
          {
            ttl: 60,
            limit: ConfigService.isDevelopment ? 100 : 10,
          },
        ],
      }),
      inject: [AppConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
