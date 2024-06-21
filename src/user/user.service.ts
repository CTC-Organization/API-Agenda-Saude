import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { hash } from 'bcryptjs';
import { excludeFieldsInEntity } from './../utils/exclude-fields';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser({ email, password }: CreateUserDto) {
        if (await this.userRepository.findByEmail(email)) {
            throw new BadRequestException('Email indisponível');
        }

        const passwordHashed = await hash(password, 8);

        const user = await this.userRepository.create({
            email,
            password: passwordHashed,
        });

        //excludeFieldsInEntity(user, 'password');
        delete user.password;
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new BadRequestException('Email e/ou senha incorreto(s)');
            // Ou o usuário não existe (mas não retorna isso por segurança)
        }
        // delete user.password;
        return user;
    }
}
