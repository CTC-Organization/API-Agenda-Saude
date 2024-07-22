import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { randomUUID } from 'node:crypto';

const mockUserRepository = {
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserByCpf: jest.fn(),
};

let userRepository: UserRepository;

describe('UserService', () => {
    let sut: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, { provide: UserRepository, useValue: mockUserRepository }],
        }).compile();
        sut = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create an user', async () => {
        // Mock UserRepository behavior to return undefined (indicating email is not in use)
        mockUserRepository.findUserByEmail.mockResolvedValue(undefined);

        // Mock the created user
        const createdUser = {
            id: randomUUID(),
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };

        // Mock UserRepository behavior to return the created user
        mockUserRepository.createUser.mockResolvedValue(createdUser);

        // Call the createUser method
        const result = await sut.createUser({
            email: createdUser.email,
            password: createdUser.password,
            cpf: createdUser.cpf,
        });
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith(createdUser.email);
        // Expect the result to be the created user
        expect(result.email).toEqual(createdUser.email);
    });

    it('should not create a user if email is already in use', async () => {
        // Mock user data
        const userData = {
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };
        // Mock UserRepository behavior to return a user (indicating email is in use)
        mockUserRepository.findUserByEmail.mockResolvedValue(userData.email);
        // Call the createUser method
        await expect(
            sut.createUser({ email: userData.email, password: 'xxxxx', cpf: 'xxxxx' }),
        ).rejects.toThrow('Email indisponível');
        // Expect UserRepository to have been called with the provided email
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith(userData.email);
        // Expect UserRepository.create NOT to have been called
        expect(userRepository.createUser).not.toHaveBeenCalled();
    });
    it('should not create a user if CPF is already in use', async () => {
        mockUserRepository.findUserByEmail.mockResolvedValue(undefined);
        // Mock user data
        const userData = {
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };
        // Mock UserRepository behavior to return a user (indicating email is in use)
        mockUserRepository.findUserByCpf.mockResolvedValue(userData.cpf);
        // Call the createUser method
        await expect(
            sut.createUser({
                email: userData.email,
                password: userData.password,
                cpf: userData.cpf,
            }),
        ).rejects.toThrow('CPF indisponível');
        // Expect UserRepository to have been called with the provided email
        expect(userRepository.findUserByCpf).toHaveBeenCalledWith(userData.cpf);
        // Expect UserRepository.create NOT to have been called
        expect(userRepository.createUser).not.toHaveBeenCalled();
    });
});
