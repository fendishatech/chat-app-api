import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  ParseIntPipe,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Creates a new user in the system with the provided username and optional email/avatar'
  })
  @ApiCreatedResponse({
    description: 'User has been successfully created',
    schema: {
      example: {
        id: 1,
        username: 'alice123',
        email: 'alice@example.com',
        avatar: 'https://example.com/avatar.jpg',
        isOnline: false,
        lastSeen: '2024-01-01T12:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['Username must be at least 2 characters long'],
        error: 'Bad Request'
      }
    }
  })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieves a list of all users in the system'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all users',
    schema: {
      example: [
        {
          id: 1,
          username: 'alice123'
        },
        {
          id: 2,
          username: 'bob456'
        }
      ]
    }
  })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their ID, including their recent messages'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 1,
    type: 'integer'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details with recent messages',
    schema: {
      example: {
        id: 1,
        username: 'alice123',
        email: 'alice@example.com',
        avatar: 'https://example.com/avatar.jpg',
        isOnline: true,
        lastSeen: '2024-01-01T12:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        messages: [
          {
            id: 1,
            content: 'Hello world!',
            createdAt: '2024-01-01T12:00:00.000Z'
          }
        ]
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 1 not found',
        error: 'Not Found'
      }
    }
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Get('username/:username')
  @ApiOperation({ 
    summary: 'Get user by username',
    description: 'Retrieves a specific user by their username'
  })
  @ApiParam({
    name: 'username',
    description: 'Username to search for',
    example: 'alice123',
    type: 'string'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    schema: {
      example: {
        id: 1,
        username: 'alice123',
        email: 'alice@example.com',
        avatar: 'https://example.com/avatar.jpg',
        isOnline: true,
        lastSeen: '2024-01-01T12:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'User not found'
  })
  async getUserByUsername(@Param('username') username: string) {
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update user',
    description: 'Updates an existing user with new information'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to update',
    example: 1,
    type: 'integer'
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated',
    schema: {
      example: {
        id: 1,
        username: 'alice123_updated',
        email: 'alice_new@example.com',
        avatar: 'https://example.com/new-avatar.jpg',
        isOnline: true,
        lastSeen: '2024-01-01T12:00:00.000Z',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:30:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'User not found'
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete user',
    description: 'Deletes a user from the system permanently'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID to delete',
    example: 1,
    type: 'integer'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully deleted',
    schema: {
      example: {
        id: 1,
        username: 'alice123',
        email: 'alice@example.com',
        message: 'User deleted successfully'
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'User not found'
  })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
} 