import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AppConfigService } from './app-config.service';

export const mailerConfig = (
  configService: AppConfigService,
): MailerOptions => ({
  transport: {
    host: configService.emailHost,
    port: configService.emailPort,
    auth: {
      user: configService.emailUser,
      pass: configService.emailPassword,
    },
  },
  defaults: {
    from: `"NestJS Security" <${configService.emailUser}>`,
  },
  template: {
    dir: process.cwd() + '/src/templates/',
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
