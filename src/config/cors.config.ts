import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppConfigService } from './app-config.service';

export const corsConfig = (configService: AppConfigService): CorsOptions => ({
  origin: configService.isDevelopment
    ? true
    : ['https://domain.com', 'https://www.domain.com'],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});
