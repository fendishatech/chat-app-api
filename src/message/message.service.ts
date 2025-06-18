import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, User } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';

export interface UpdateMessageDto {
  content?: string;
}

export type MessageWithUser = Message & {
  user: Pick<User, 'id' | 'username'>;
};

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async createMessage(data: CreateMessageDto): Promise<MessageWithUser> {
    return this.prisma.message.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async findMessageById(id: number): Promise<MessageWithUser | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getRecentMessages(limit: number = 50): Promise<MessageWithUser[]> {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getMessagesByUser(userId: number, limit: number = 50): Promise<MessageWithUser[]> {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async updateMessage(id: number, data: UpdateMessageDto): Promise<MessageWithUser> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return this.prisma.message.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async deleteMessage(id: number): Promise<Message> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return this.prisma.message.delete({
      where: { id },
    });
  }
} 