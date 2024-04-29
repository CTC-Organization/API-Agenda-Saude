import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { randomUUID } from 'node:crypto';

const mockUserRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
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
        // Mock user data
        const userData = {
            id: randomUUID(),
            email: 'test@example.com',
            password: 'xxxxx',
        };

        // Mock UserRepository behavior to return undefined (indicating email is not in use)
        mockUserRepository.findByEmail.mockResolvedValue(undefined);

        // Mock the created user
        const createdUser = {
            id: randomUUID(),
            email: userData.email,
            password: 'xxxxx',
        };

        // Mock UserRepository behavior to return the created user
        mockUserRepository.create.mockResolvedValue(createdUser);

        // Call the createUser method
        const result = await sut.createUser({
            email: userData.email,
            password: createdUser.password,
        });

        expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);

        // Expect the result to be the created user
        expect(result.email).toEqual(createdUser.email);
    });

    it('should not create a user if email is already in use', async () => {
        // Mock user data
        const userData = {
            id: '123456',
            email: 'test@example.com',
            password: 'xxxxx',
        };

        // Mock UserRepository behavior to return a user (indicating email is in use)
        mockUserRepository.findByEmail.mockResolvedValue(userData.email);

        // Call the createUser method
        await expect(sut.createUser({ email: userData.email, password: 'xxxxx' })).rejects.toThrow(
            'Email indisponível',
        );

        // Expect UserRepository to have been called with the provided email
        expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);

        // Expect UserRepository.create NOT to have been called
        expect(userRepository.create).not.toHaveBeenCalled();
    });
});
