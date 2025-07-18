import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppConfigService, jwtConfig, mailerConfig } from 'src/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
