import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from './app-config.service';

export const typeOrmConfig = (
  configService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: configService.databaseHost,
  port: configService.databasePort,
  username: configService.databaseUser,
  password: configService.databasePassword,
  database: configService.databaseName,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], //This allows TypeORM to automatically load all entity files, no matter where they are in the project
  synchronize: configService.isDevelopment, // When set to true, TypeORM automatically syncs your database schema with your entities every time the app starts.
  logging: configService.isDevelopment, // 'logging' is enabled only in development mode to help debug queries.
  ssl: configService.isProduction ? { rejectUnauthorized: false } : false,
});
