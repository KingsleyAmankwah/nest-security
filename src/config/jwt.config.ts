import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/*
  A function that returns the JwtModule configuration object.
  It uses the ConfigService to read environment variables or fallback defaults,
  setting up JWT signing options.

  Parameters:
    - configService: an instance of ConfigService to access environment variables.

  Returns:
    - An object conforming to JwtModuleOptions, which NestJS uses to configure JwtModule.

  Details:
    - 'secret' specifies the JWT signing secret.
    - 'signOptions' sets the token expiration time (15 minutes for access tokens).
*/

export const jwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get<string>('JWT_SECRET', '??'),
  signOptions: { expiresIn: '15m' },
});
