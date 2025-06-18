import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username for the user',
    example: 'alice123',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username: string;

  @ApiProperty({
    description: 'The email address of the user (optional)',
    example: 'alice@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Avatar URL for the user (optional)',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
} 