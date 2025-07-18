import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { LoggingInterceptor } from 'src/common/logging.interceptor';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { currentUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('user')
@UseInterceptors(LoggingInterceptor)
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getCurrentUserProfile(@currentUser() user: User) {
    return this.userService.getUserById(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.getAllUsers(Number(page), Number(limit));
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
