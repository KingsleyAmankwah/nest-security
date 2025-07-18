import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'src/config/mailer.config';
import { AppConfigService } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: jwtConfig,
      inject: [AppConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: mailerConfig,
      inject: [AppConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
