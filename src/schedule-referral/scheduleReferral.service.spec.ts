import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleReferralRepository } from './scheduleReferral.repository';
import { ScheduleReferralService } from './scheduleReferral.service';
import { randomUUID } from 'node:crypto';

const mockScheduleReferralRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
};

let scheduleReferralRepository: ScheduleReferralRepository;

describe('ScheduleReferralService', () => {
    let sut: ScheduleReferralService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ScheduleReferralService,
                { provide: ScheduleReferralRepository, useValue: mockScheduleReferralRepository },
            ],
        }).compile();

        sut = module.get<ScheduleReferralService>(ScheduleReferralService);
        scheduleReferralRepository = module.get<ScheduleReferralRepository>(
            ScheduleReferralRepository,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an scheduleReferral', async () => {
        // Mock scheduleReferral data
        const scheduleReferralData = {
            id: randomUUID(),
            email: 'test@example.com',
            password: 'xxxxx',
        };

        // Mock ScheduleReferralRepository behavior to return undefined (indicating email is not in use)
        mockScheduleReferralRepository.findByEmail.mockResolvedValue(undefined);

        // Mock the created scheduleReferral
        const createdScheduleReferral = {
            id: randomUUID(),
            email: scheduleReferralData.email,
            password: 'xxxxx',
        };

        // Mock ScheduleReferralRepository behavior to return the created scheduleReferral
        mockScheduleReferralRepository.create.mockResolvedValue(createdScheduleReferral);

        // Call the createScheduleReferral method
        const result = await sut.createScheduleReferral({
            email: scheduleReferralData.email,
            password: createdScheduleReferral.password,
        });

        expect(scheduleReferralRepository.findByEmail).toHaveBeenCalledWith(
            scheduleReferralData.email,
        );

        // Expect the result to be the created scheduleReferral
        expect(result.email).toEqual(createdScheduleReferral.email);
    });

    it('should not create a scheduleReferral if email is already in use', async () => {
        // Mock scheduleReferral data
        const scheduleReferralData = {
            id: '123456',
            email: 'test@example.com',
            password: 'xxxxx',
        };

        // Mock ScheduleReferralRepository behavior to return a scheduleReferral (indicating email is in use)
        mockScheduleReferralRepository.findByEmail.mockResolvedValue(scheduleReferralData.email);

        // Call the createScheduleReferral method
        await expect(
            sut.createScheduleReferral({ email: scheduleReferralData.email, password: 'xxxxx' }),
        ).rejects.toThrow('Email indisponível');

        // Expect ScheduleReferralRepository to have been called with the provided email
        expect(scheduleReferralRepository.findByEmail).toHaveBeenCalledWith(
            scheduleReferralData.email,
        );

        // Expect ScheduleReferralRepository.create NOT to have been called
        expect(scheduleReferralRepository.create).not.toHaveBeenCalled();
    });
});
