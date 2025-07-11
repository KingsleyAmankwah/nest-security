import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  /*
    Registers a new user by creating a new User entity, hashing the password,
    generating an email verification token, and sending a verification email.

    Parameters:
      - registerDto: Contains user registration details like email, password, firstName, and lastName.

    Returns:
      - A message indicating successful registration and instructions to verify the email.
  */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    await this.userRepository.save(user);

    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}&userId=${user.id}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      template: 'verify-email',
      context: {
        firstName: firstName,
        verificationUrl,
      },
    });

    return {
      message:
        'Registration successful, please check your email to verify your account.',
    };
  }

  /* 
  Verifies the user's email using the provided token and userId.
  Parameters:
    - verifyEmailDto: Contains the token and userId for verification.
  Returns:
    - A message indicating successful email verification.
  Throws:
    - BadRequestException if the token or userId is invalid or expired.
    - UnauthorizedException if the user is not found or email is already verified.
  */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { userId, token } = verifyEmailDto;
    const user = await this.userRepository.findOne({
      where: { id: userId, emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token or user ID');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await this.userRepository.save(user);

    return {
      message: 'Email verification successful, you can now log in.',
    };
  }
  /*
  Logs in a user by validating their credentials and generating JWT tokens.
  Parameters:
    - loginDto: Contains the user's email and password.
  Returns:
    - An object containing accessToken and refreshToken.
  Throws:
    - UnauthorizedException if the credentials are invalid or email is not verified.
  */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user?.isEmailVerified) {
      throw new UnauthorizedException(
        'Invalid credentials or email not verified',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  /* 
  Refreshes the access token using the provided refresh token.
  Parameters:
    - userId: The ID of the user requesting the token refresh.
    - refreshToken: The refresh token provided by the user.
  Returns:
    - An object containing a new accessToken.
  Throws:
    - UnauthorizedException if the refresh token is invalid or expired.
    - BadRequestException if the user is not found.
  */
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (
      !user?.refreshToken ||
      (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date())
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  /* Logs out a user by clearing their refresh token and its expiration.
  Parameters: 
    - userId: The ID of the user logging out.
  Returns:
    - A message indicating successful logout.
  Throws:
    - BadRequestException if the user is not found.
  */
  async logout(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await this.userRepository.save(user);

    return { message: 'Logout successful' };
  }

  /*
  Resends the email verification link to the user.
  Parameters:
    - email: The email address of the user requesting verification.
  Returns:
    - A message indicating that the verification email has been sent.
  Throws:
    - BadRequestException if the user is not found or email is already verified.
  */
  async resendVerification(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiresAt = expiresAt;
    await this.userRepository.save(user);

    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}&userId=${user.id}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Request Email Verification',
      template: 'verify-email',
      context: {
        firstName: user.firstName,
        verificationUrl,
      },
    });

    return {
      message:
        'Verification email sent, please check your inbox to verify your account.',
    };
  }

  /*
  Initiates a password reset process by sending a reset link to the user's email.
  Parameters:
    - email: The email address of the user requesting a password reset.
  Returns:
    - A message indicating that the password reset email has been sent.
  Throws:
    - BadRequestException if the user is not found.
  */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    user.emailVerificationToken = resetToken; // Reusing the token field for password reset
    user.emailVerificationTokenExpiresAt = expiresAt;
    await this.userRepository.save(user);

    const resetPasswordUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}&userId=${user.id}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'reset-password',
      context: {
        firstName: user.firstName,
        resetPasswordUrl,
      },
    });

    return {
      message:
        'Password reset email sent, please check your inbox to reset your password.',
    };
  }

  /* 
  Resets the user's password using the provided token and new password.
  Parameters:
    - userId: The ID of the user resetting their password.
    - token: The reset token sent to the user's email.
    - newPassword: The new password to set for the user.
  Returns:
    - A message indicating successful password reset.
  Throws:
    - BadRequestException if the token or userId is invalid or expired.
    - UnauthorizedException if the user is not found or token does not match.
  */
  async resetPassword(userId: string, token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user.emailVerificationToken !== token) {
      throw new BadRequestException('Invalid token or user ID');
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token has expired');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailVerificationToken = undefined; // Clear the token after use
    user.emailVerificationTokenExpiresAt = undefined;
    await this.userRepository.save(user);

    return {
      message:
        'Password reset successful, you can now log in with your new password.',
    };
  }
}
