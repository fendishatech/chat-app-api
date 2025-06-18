import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MessageService, MessageWithUser } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { RedisService } from '../redis/redis.service';

interface JoinRoomData {
  username: string;
  userId: number;
}

interface SendMessageData {
  content: string;
  userId: number;
}

interface TypingData {
  userId: number;
  username: string;
  isTyping: boolean;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, { userId: number; username: string }>();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Send recent messages to the newly connected client
    try {
      const recentMessages = await this.messageService.getRecentMessages(20);
      client.emit('recentMessages', recentMessages.reverse()); // Reverse to show oldest first
    } catch (error) {
      this.logger.error('Failed to fetch recent messages', error);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.connectedUsers.delete(client.id);
      
      // Notify others that user left
      this.server.emit('userLeft', {
        userId: userInfo.userId,
        username: userInfo.username,
        timestamp: new Date(),
      });

      // Update online users list
      this.broadcastOnlineUsers();
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: JoinRoomData,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Verify user exists
      const user = await this.userService.findUserById(data.userId);
      if (!user) {
        client.emit('error', { message: 'User not found' });
        return;
      }

      // Store user info
      this.connectedUsers.set(client.id, {
        userId: data.userId,
        username: data.username,
      });

      // Join the main chat room
      client.join('main-chat');

      // Notify others about new user
      this.server.to('main-chat').emit('userJoined', {
        userId: data.userId,
        username: data.username,
        timestamp: new Date(),
      });

      // Send current online users to the new user
      this.broadcastOnlineUsers();

      this.logger.log(`User ${data.username} (${data.userId}) joined chat`);
    } catch (error) {
      this.logger.error('Error in joinChat', error);
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageData,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Validate message data
      if (!data.content?.trim()) {
        client.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      if (!data.userId) {
        client.emit('error', { message: 'User ID is required' });
        return;
      }

      // Create message in database
      const messageData: CreateMessageDto = {
        content: data.content.trim(),
        userId: data.userId,
      };

      const message = await this.messageService.createMessage(messageData);

      // Broadcast message to all connected clients
      this.server.to('main-chat').emit('newMessage', {
        id: message.id,
        content: message.content,
        userId: message.userId,
        user: message.user,
        createdAt: message.createdAt,
      });

      // Store in Redis for caching (optional)
      if (this.redisService.isRedisConnected()) {
        const redisClient = this.redisService.getClient();
        await redisClient.lpush('recent_messages', JSON.stringify(message));
        await redisClient.ltrim('recent_messages', 0, 49); // Keep only last 50 messages
      }

      this.logger.log(`Message sent by user ${data.userId}: ${data.content}`);
    } catch (error) {
      this.logger.error('Error in sendMessage', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingData,
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast typing indicator to other users
    client.to('main-chat').emit('userTyping', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    this.broadcastOnlineUsersToClient(client);
  }

  @SubscribeMessage('getRecentMessages')
  async handleGetRecentMessages(@ConnectedSocket() client: Socket) {
    try {
      const messages = await this.messageService.getRecentMessages(50);
      client.emit('recentMessages', messages.reverse());
    } catch (error) {
      this.logger.error('Error fetching recent messages', error);
      client.emit('error', { message: 'Failed to fetch messages' });
    }
  }

  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.connectedUsers.values());
    this.server.to('main-chat').emit('onlineUsers', onlineUsers);
  }

  private broadcastOnlineUsersToClient(client: Socket) {
    const onlineUsers = Array.from(this.connectedUsers.values());
    client.emit('onlineUsers', onlineUsers);
  }
}