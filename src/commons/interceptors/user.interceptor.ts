import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { AuthService } from '@/services/auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class UserInterceptor implements NestInterceptor {
    constructor(private readonly authService: AuthService) {}
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const { authorization } = req.headers;

        if (authorization) {
            try {
                const token = (authorization ?? '').split(' ')[1];
                const user = await this.authService.checkToken(token);
                req.user = user;
                req.body = req.body;
            } catch (e) {
                // Handle token verification error if necessary
            }
        }

        return next.handle();
    }
}
