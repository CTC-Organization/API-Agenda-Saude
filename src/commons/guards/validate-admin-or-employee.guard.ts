import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '@prisma/postgres-client';
@Injectable()
export class ValidateIsAdminOrEmployee implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;

        try {
            const user = await this.authService.checkToken((authorization ?? '').split(' ')[1]);
            if (!(user.role === UserRole.ADMIN) && !(user.role === UserRole.EMPLOYEE)) {
                return false;
            }

            return true;
        } catch (e) {
            return false;
        }
    }
}
