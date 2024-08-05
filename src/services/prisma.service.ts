import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/postgres-client';// Supondo que este seja o nome do cliente para PostgreSQL

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public readonly client = new PrismaClient({
        log: ['warn', 'error'],
    });


    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }
}
