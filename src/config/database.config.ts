import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

/* 
  A function that returns the TypeORM configuration object.
  It uses the ConfigService to read environment variables or fallback defaults,
  setting up connection details for a PostgreSQL database.
  
  Parameters:
    - configService: an instance of ConfigService to access environment variables.

  Returns:
    - An object conforming to TypeOrmModuleOptions, which NestJS uses to configure TypeORM.
  
  Details:
    - 'type' specifies the database type (Postgres).
    - 'host', 'port', 'username', 'password', 'database' are retrieved from env variables or use defaults.
    - 'synchronize' When set to true, TypeORM automatically syncs your database schema with your entities every time the app starts.
    - 'logging' is enabled only in development mode to help debug queries.
*/

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  entities: [User],
  synchronize: configService.get<string>('NODE_ENV') !== 'production', // Disable in production
  logging: configService.get<string>('NODE_ENV') === 'development', // Enable logging in development
});
