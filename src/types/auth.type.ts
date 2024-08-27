import { UserRole } from '@prisma/postgres-client';

export type AuthType = {
    id: string;
    name: string;
    role: UserRole;
    accessToken: string;
};
