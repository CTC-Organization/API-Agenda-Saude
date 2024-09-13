import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '@prisma/postgres-client';
@Injectable()
export class ValidateIsUserSelfOrAdmin implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;

        try {
            const user = await this.authService.checkToken((authorization ?? '').split(' ')[1]);
            if (
                !(user.id === request.params.id || user.id === request?.body?.patientId) &&
                !(user?.userId === request.params.id) &&
                !(user.role === UserRole.ADMIN)
            ) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }
}
