import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MessageService, UpdateMessageDto } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new message',
    description: 'Creates a new message in the chat system'
  })
  @ApiResponse({
    status: 201,
    description: 'Message has been successfully created',
    schema: {
      example: {
        id: 1,
        content: 'Hello everyone!',
        userId: 1,
        user: {
          id: 1,
          username: 'alice123'
        },
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiBody({ type: CreateMessageDto })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }

  @Get('recent')
  @ApiOperation({ 
    summary: 'Get recent messages',
    description: 'Retrieves the most recent messages from the chat'
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to retrieve',
    example: 50,
    required: false,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'List of recent messages',
    schema: {
      example: [
        {
          id: 1,
          content: 'Hello everyone!',
          userId: 1,
          user: {
            id: 1,
            username: 'alice123'
          },
          createdAt: '2024-01-01T12:00:00.000Z'
        }
      ]
    }
  })
  async getRecentMessages(@Query('limit') limit: string = '50') {
    return this.messageService.getRecentMessages(parseInt(limit));
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get messages by user',
    description: 'Retrieves all messages sent by a specific user'
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user whose messages to retrieve',
    example: 1,
    type: 'integer'
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of messages to retrieve',
    example: 50,
    required: false,
    type: 'number'
  })
  async getMessagesByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit') limit: string = '50',
  ) {
    return this.messageService.getMessagesByUser(userId, parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get message by ID',
    description: 'Retrieves a specific message by its ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 1,
    type: 'integer'
  })
  async getMessageById(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.findMessageById(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update message',
    description: 'Updates the content of an existing message'
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID to update',
    example: 1,
    type: 'integer'
  })
  async updateMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateMessage(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete message',
    description: 'Deletes a message from the chat'
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID to delete',
    example: 1,
    type: 'integer'
  })
  async deleteMessage(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.deleteMessage(id);
  }
} 