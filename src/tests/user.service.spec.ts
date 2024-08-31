import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repositories/user.repository';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '@/dto/create-user.dto';

const mockUserRepository = {
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    // findUserByCpf: jest.fn(),
};

let userRepository: UserRepository;

const data: CreateUserDto = {
    email: 'email@gmail.com',
    password: 'password',
    cpf: 'cpf',
    name: 'John Doe',
    phoneNumber: '1234567890',
    role: 'PATIENT',
};

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
        mockUserRepository.findUserByEmail.mockResolvedValue(undefined);
        mockUserRepository.createUser.mockResolvedValue(data);

        const result = await sut.createUser(data);
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith(data.email);
        expect(result.email).toEqual(data.email);
    });

    it('should not create a user if email is already in use', async () => {
        mockUserRepository.findUserByEmail.mockResolvedValue(data.email);
        await expect(sut.createUser(data)).rejects.toThrow('Email indisponível');
        expect(userRepository.findUserByEmail).toHaveBeenCalledWith(data.email);
        expect(userRepository.createUser).not.toHaveBeenCalled();
    });
    // it('should not create a user if CPF is already in use', async () => {
    //     mockUserRepository.findUserByEmail.mockResolvedValue(undefined);
    //     mockUserRepository.findUserByCpf.mockResolvedValue(data.cpf);
    //     await expect(sut.createUser(data)).rejects.toThrow('CPF indisponível');
    //     expect(userRepository.findUserByCpf).toHaveBeenCalledWith(data.cpf);
    //     expect(userRepository.createUser).not.toHaveBeenCalled();
    // });
});
