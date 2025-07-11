import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
    port: configService.get<number>('EMAIL_PORT', 587),
    auth: {
      user: configService.get<string>('EMAIL_USER', 'your_email@gmail.com'),
      pass: configService.get<string>('EMAIL_PASS', 'your_email_password'),
    },
  },
  defaults: {
    from: '"Your App" <no-reply@yourapp.com>',
  },
  template: {
    dir: process.cwd() + '/src/templates/',
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
