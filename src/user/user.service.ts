import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { hash } from 'bcryptjs';
import { excludeFieldsInEntity } from './../utils/exclude-fields';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser({ email, password, cpf, name, phoneNumber, role }: CreateUserDto) {
        if (await this.userRepository.findUserByEmail(email)) {
            throw new BadRequestException('Email indisponível');
        } else if (await this.userRepository.findUserByCpf(cpf)) {
            throw new BadRequestException('CPF indisponível');
        }

        const passwordHashed = await hash(password, 10);

        const user = await this.userRepository.createUser({
            cpf,
            email,
            password: passwordHashed,
            name,
            phoneNumber,
            role,
        });

        excludeFieldsInEntity(user, 'password');

        return user;
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        excludeFieldsInEntity(user, 'password');
        return user;
    }
    async getUserByCpf(cpf: string) {
        const user = await this.userRepository.findUserByCpf(cpf);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        excludeFieldsInEntity(user, 'password');
        return user;
    }
}
