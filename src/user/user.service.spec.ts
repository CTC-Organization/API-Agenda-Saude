import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        it('should create a user with valid email and password', async () => {
            const createUserDto: CreateUserDto = {
                email: faker.internet.email(),
                password: faker.internet.password(),
            };
            const createdUser = await service.createUser(createUserDto);
            expect(createdUser).toBeDefined();
            // Add more assertions as needed
        });

        it('should throw an error if email is missing', async () => {
            const createUserDto = {
                email: '',
                password: faker.internet.password(),
            };
            await expect(service.createUser(createUserDto)).rejects.toThrow(ZodError);
            // Se o serviço não lançar uma exceção com a mensagem 'Email is required', o teste passará.
        });

        it('should not throw an error if password is missing', async () => {
            const createUserDto = {
                email: faker.internet.email(),
                password: '',
            };
            await expect(service.createUser(createUserDto)).rejects.toThrow(ZodError);
            // Se o serviço não lançar uma exceção com a mensagem 'Password is required', o teste passará.
        });

        it('should not throw an error if all is missing', async () => {
            const createUserDto = {
                email: '',
                password: '',
            };
            await expect(service.createUser(createUserDto)).rejects.toThrow(ZodError);
            // Se o serviço não lançar uma exceção com a mensagem 'Password is required', o teste passará.
        });

        // Teste para email com formatação inválida
        it('should not throw an error if email is not in valid format', async () => {
            const createUserDto = {
                email: 'invalid_email_format',
                password: faker.internet.password(),
            };
            await expect(service.createUser(createUserDto)).rejects.toThrow(ZodError);
            // Se o serviço não lançar uma exceção com a mensagem 'Invalid email format', o teste passará.
        });
    });
});
