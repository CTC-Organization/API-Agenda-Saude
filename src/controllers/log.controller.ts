import { Body, Controller, Post } from '@nestjs/common';

@Controller('logs')
export class LogController {
    constructor() {}

    @Post('log')
    async logData(@Body() log: { message: string }) {
        console.log('Log recebido do app:', log.message);
        // Ou armazene os logs em um banco de dados, se necessário
    }
}
