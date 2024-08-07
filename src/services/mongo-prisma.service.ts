import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/mongodb-client';

@Injectable()
export class MongoPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            log: ['warn', 'error'],
        });
    }
    async onModuleInit() {
        await this.$connect();
        await this.initializeCityHallCollection();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async initializeCityHallCollection() {
        try {
            const collections = await this.cityHall.findRaw({});

            const collectionExists = collections.documents;

            if (!collectionExists) {
                await this.$runCommandRaw({
                    insert: 'city_halls',
                    documents: [{ name: 'Recife', state: 'PE' }],
                });
            } else {
                // Verifica se há algum documento na coleção
                const cityHallCount = await this.$runCommandRaw({
                    count: 'city_halls',
                    query: {},
                });
                if (cityHallCount.n === 0) {
                    await this.$runCommandRaw({
                        insert: 'city_halls',
                        documents: [{ name: 'Recife', state: 'PE' }],
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao inicializar a coleção city_halls:', error);
        }
    }
}
