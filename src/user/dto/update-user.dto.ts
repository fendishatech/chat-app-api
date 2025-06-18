import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsEmail, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username for the user',
    example: 'alice123_updated',
    minLength: 2,
    maxLength: 30,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Username must be at least 2 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'alice_updated@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    description: 'Avatar URL for the user',
    example: 'https://example.com/new-avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Online status of the user',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;
} 