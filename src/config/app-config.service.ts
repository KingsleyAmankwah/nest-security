import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // App configuration
  get port() {
    return this.configService.get<number>('PORT');
  }

  get nodeEnv() {
    return this.configService.get<string>('NODE_ENV');
  }

  get isProduction() {
    return this.nodeEnv === 'production';
  }

  get isDevelopment() {
    return this.nodeEnv === 'development';
  }

  // Database configuration
  get databaseUser() {
    const user = this.configService.get<string>('DATABASE_USER');
    if (!user) {
      throw new Error('DATABASE_USER is required');
    }
    return user;
  }

  get databasePassword() {
    const password = this.configService.get<string>('DATABASE_PASSWORD');
    if (!password) {
      throw new Error('DATABASE_PASSWORD is required');
    }
    return password;
  }

  get databaseName() {
    return this.configService.get<string>('DATABASE_NAME');
  }

  get databaseHost() {
    return this.configService.get<string>('DATABASE_HOST');
  }

  get databasePort() {
    return this.configService.get<number>('DATABASE_PORT');
  }

  // JWT configuration
  get jwtSecret() {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    return secret;
  }

  get jwtExpiresIn() {
    return this.configService.get<string>('JWT_EXPIRATION', '24h');
  }

  get jwtRefreshSecret() {
    return this.configService.get<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn() {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION');
  }

  // Cloudinary configuration
  get cloudinaryCloudName() {
    return this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
  }

  get cloudinaryApiKey() {
    return this.configService.get<string>('CLOUDINARY_API_KEY');
  }

  get cloudinaryApiSecret() {
    return this.configService.get<string>('CLOUDINARY_API_SECRET');
  }

  // Email configuration
  get emailHost() {
    return this.configService.get<string>('EMAIL_HOST');
  }

  get emailPort() {
    return this.configService.get<number>('EMAIL_PORT');
  }

  get emailUser() {
    return this.configService.get<string>('EMAIL_USER');
  }

  get emailPassword() {
    return this.configService.get<string>('EMAIL_PASSWORD');
  }

  // Grouped configuration objects
  get database() {
    return {
      host: this.databaseHost,
      port: this.databasePort,
      username: this.databaseUser,
      password: this.databasePassword,
      database: this.databaseName,
    };
  }

  get jwt() {
    return {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
      refreshSecret: this.jwtRefreshSecret,
      refreshExpiresIn: this.jwtRefreshExpiresIn,
    };
  }
}
