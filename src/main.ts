import { NestFactory } from '@nestjs/core';
import { ForbiddenException, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';

async function bootstrap() {
    const logger = new Logger(AppModule.name);

    const whitelist = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:8000',
        'http://localhost:8001',
        'http://localhost:8002',
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

    console.log('ValidationPipe configured with:', validationPipe);

    app.useGlobalPipes(validationPipe);

    await app.listen(process.env.PORT || 8080);

    Logger.log(
        `Server running on port ${process.env.PORT}`,
        process.env.NODE_ENV.toUpperCase() + ' MODE',
    );
}
bootstrap();
