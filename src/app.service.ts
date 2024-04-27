import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {} // Injete o serviço Prisma

  async getUsers() {
    return this.prisma.user.findMany(); // Use o Prisma para acessar os usuários no banco de dados
  }

  async createUser(name: string) {
    return this.prisma.user.create({
      data: {
        email: name,
      },
    });
  }
}
