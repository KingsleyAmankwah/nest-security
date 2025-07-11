import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.get<string>('EMAIL_HOST'),
    port: configService.get<number>('EMAIL_PORT'),
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  },
  defaults: {
    from: '"NestJS Security" <no-reply@nestjs.com>',
  },
  template: {
    dir: process.cwd() + '/src/templates/',
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
