import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/mongodb-client';

@Injectable()
export class MongoPrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly client = new PrismaClient();

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Adicione métodos para interagir com o banco de dados MongoDB aqui
}
