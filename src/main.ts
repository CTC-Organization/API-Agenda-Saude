import { NestFactory } from '@nestjs/core';
import { ForbiddenException, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger(AppModule.name);

    const whitelist = [
        // comentar localhosts ao estar 100% em produção
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:8000',
        'http://localhost:8001',
        'http://localhost:8002',
        'https://api-agenda-saude-production.up.railway.app',
    ];

    const app = await NestFactory.create(AppModule, {
        cors: {
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
            origin: function (origin, callback) {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                if (whitelist.includes(origin)) {
                    callback(null, true);
                } else {
                    logger.warn(`Origin: ${origin} not allowed by CORS`);
                    callback(new ForbiddenException('Not allowed by CORS'), false);
                }
            },
        },
    });

    const validationPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    app.useGlobalPipes(validationPipe);

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    };

    const config = new DocumentBuilder()
        .setTitle('API Agenda Saúde')
        .setDescription('Apresentação das rotas presentes em ambiente de produção')
        .setVersion('0.01')
        .addTag('agenda saude')
        .build();

    const document = SwaggerModule.createDocument(app, config, options);

    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT || 8080);

    Logger.log(
        `Server running on port ${process.env.PORT}`,
        process.env.NODE_ENV.toUpperCase() + ' MODE',
    );
}
bootstrap();
