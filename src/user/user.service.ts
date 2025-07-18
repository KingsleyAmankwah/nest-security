import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from 'src/config';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: AppConfigService,
    private readonly mailerService: MailerService,
  ) {}
  /*
    Retrieves the user's profile information (All users).
    Parameters:
      - userId: The ID of the authenticated user.
    Returns:
      - User profile without sensitive information.
    Throws:
      - NotFoundException if the user is not found.
  */
  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, emailVerificationToken, ...profile } = user;
    return profile;
  }

  /*
    Updates the user's profile information. (All Users)
    Parameters:
      - userId: The ID of the user.
      - updateUserDto: Contains the updated user information.
    Returns:
      - Updated user profile without sensitive information.
    Throws:
      - NotFoundException if the user is not found.
  */
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.preload({
      id: userId,
      ...updateUserDto,
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userRepository.save(userToUpdate);
    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    };
  }

  /*
    Retrieves all users (Admin only).
    Parameters:
      - page: Page number for pagination (default: 1).
      - limit: Number of users per page (default: 10).
    Returns:
      - Paginated list of users without sensitive information.
  */
  async getAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const safeUsers = users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, refreshToken, emailVerificationToken, ...safeUser } =
        user;

      return safeUser;
    });

    return {
      users: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /*
    Creates a new user (Admin only).
    Parameters:
      - createUserDto: Contains user information.
    Returns:
      - Created user profile without sensitive information.
    Throws:
      - BadRequestException if email already exists.
  */
  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); //1hr

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    await this.userRepository.save(user);
    try {
      const verificationUrl = `${this.configService.frontendURL}/verify-email?token=${verificationToken}&userId=${user.id}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify Your Email Address',
        template: 'verify-email',
        context: {
          firstName: user.firstName,
          verificationUrl,
        },
      });

      return {
        message:
          'Registration successful, inform user to verify email account.',
      };
    } catch {
      throw new BadRequestException(
        'Registration successful, but email could not be sent',
      );
    }
  }

  /*
     Deletes a user (Admin only).
    Parameters:
      - userId: The ID of the user to delete.
    Returns:
      - Success message.
    Throws:
      - NotFoundException if the user is not found.
  */
  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
}
