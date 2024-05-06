import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
export abstract class UserRepository {
    abstract create(user: CreateUserDto): Promise<User>;
    abstract findById(id: string): Promise<Usefdfd>;
    abstract findByEmail(email: string): Promise<User | null>;
}
