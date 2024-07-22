import { Test, TestingModule } from '@nestjs/testing';
import { PatientRepository } from './patient.repository';
import { PatientService } from './patient.service';
import { randomUUID } from 'node:crypto';

const mockPatientRepository = {
    createPatient: jest.fn(),
    findPatientByEmail: jest.fn(),
    findPatientByCpf: jest.fn(),
};

let patientRepository: PatientRepository;

describe('PatientService', () => {
    let sut: PatientService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PatientService,
                { provide: PatientRepository, useValue: mockPatientRepository },
            ],
        }).compile();
        sut = module.get<PatientService>(PatientService);
        patientRepository = module.get<PatientRepository>(PatientRepository);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should create an patient', async () => {
        // Mock PatientRepository behavior to return undefined (indicating email is not in use)
        mockPatientRepository.findPatientByEmail.mockResolvedValue(undefined);

        // Mock the created patient
        const createdPatient = {
            id: randomUUID(),
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };

        // Mock PatientRepository behavior to return the created patient
        mockPatientRepository.createPatient.mockResolvedValue(createdPatient);

        // Call the createPatient method
        const result = await sut.createPatient({
            email: createdPatient.email,
            password: createdPatient.password,
            cpf: createdPatient.cpf,
        });
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(createdPatient.email);
        // Expect the result to be the created patient
        expect(result.email).toEqual(createdPatient.email);
    });

    it('should not create a patient if email is already in use', async () => {
        // Mock patient data
        const patientData = {
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };
        // Mock PatientRepository behavior to return a patient (indicating email is in use)
        mockPatientRepository.findPatientByEmail.mockResolvedValue(patientData.email);
        // Call the createPatient method
        await expect(
            sut.createPatient({ email: patientData.email, password: 'xxxxx', cpf: 'xxxxx' }),
        ).rejects.toThrow('Email indisponível');
        // Expect PatientRepository to have been called with the provided email
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(patientData.email);
        // Expect PatientRepository.create NOT to have been called
        expect(patientRepository.createPatient).not.toHaveBeenCalled();
    });
    it('should not create a patient if CPF is already in use', async () => {
        mockPatientRepository.findPatientByEmail.mockResolvedValue(undefined);
        // Mock patient data
        const patientData = {
            email: 'test@example.com',
            password: 'xxxxx',
            cpf: 'xxxxx',
        };
        // Mock PatientRepository behavior to return a patient (indicating email is in use)
        mockPatientRepository.findPatientByCpf.mockResolvedValue(patientData.cpf);
        // Call the createPatient method
        await expect(
            sut.createPatient({
                email: patientData.email,
                password: patientData.password,
                cpf: patientData.cpf,
            }),
        ).rejects.toThrow('CPF indisponível');
        // Expect PatientRepository to have been called with the provided email
        expect(patientRepository.findPatientByCpf).toHaveBeenCalledWith(patientData.cpf);
        // Expect PatientRepository.create NOT to have been called
        expect(patientRepository.createPatient).not.toHaveBeenCalled();
    });
});
