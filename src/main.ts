import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import helmet from 'helmet';
import { corsConfig } from './config/cors.config';
import { LoggingInterceptor } from './common/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);

  // Security headers
  app.use(helmet());

  // Enable CORS
  app.enableCors(corsConfig(configService));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // auto-transform payloads to DTO instances
      whitelist: true, // strips properties that aren't in DTO
      forbidNonWhitelisted: true, // throws if extra fields are sent
    }),
  );

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = configService.port || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
void bootstrap();
