import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export abstract class UserRepository {
    abstract createUser(user: CreateUserDto): Promise<User | null>;
    abstract updateUser(user: UpdateUserDto): Promise<User | null>;
    abstract findUserById(id: string): Promise<User | null>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract findUserByCpf(cpf: string): Promise<User | null>;
}