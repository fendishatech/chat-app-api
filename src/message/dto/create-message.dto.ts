import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello everyone! How are you doing today?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(1000, { message: 'Message content cannot exceed 1000 characters' })
  content: string;

  @ApiProperty({
    description: 'The ID of the user sending the message',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsPositive({ message: 'User ID must be a positive integer' })
  userId: number;
} 