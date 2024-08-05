import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../services/auth.service';
import { ROLES_KEY } from '../decorators/role.decorator';
import { UserService } from '../../services/user.service';
import { UserRole } from '@prisma/postgres-client';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        const data = this.authService.checkToken((authorization ?? '').split(' ')[1]);
        request.token = data;

        const user = await this.userService.getUserById(data.userId);
        const filteredRoles = requiredRoles.find((role) => user.role === role);

        return filteredRoles?.length > 0;
    }
}
