import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '@prisma/postgres-client';
import { Request } from 'express';
@Injectable()
export class ValidateIsUserSelf implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        try {
            console.log(request.body);
            const user = await this.authService.checkToken((authorization ?? '').split(' ')[1]);
            if (
                !(user.id === request.params.id || user.id === request?.body?.patientId) &&
                !(user?.userId === request.params.id)
            ) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }
}
