import { JwtModuleOptions } from '@nestjs/jwt';
import { AppConfigService } from './app-config.service';

export const jwtConfig = (
  configService: AppConfigService,
): JwtModuleOptions => ({
  secret: configService.jwtSecret,
  signOptions: {
    expiresIn: configService.jwtExpiresIn,
  },
});
