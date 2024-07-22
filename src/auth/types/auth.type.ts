import { UserRole } from '@prisma/client';

export type AuthType = {
    id: string;
    name: string;
    role: UserRole;
    accessToken: string;
};
