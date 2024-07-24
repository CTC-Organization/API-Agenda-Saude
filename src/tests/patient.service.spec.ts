import { Test, TestingModule } from '@nestjs/testing';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';

const mockPatientRepository = {
    createPatient: jest.fn(),
    findPatientByEmail: jest.fn(),
    findPatientByCpf: jest.fn(),
};

let patientRepository: PatientRepository;
// Mock the created patient
const data: CreatePatientDto = {
    email: 'email@gmail.com',
    password: 'password',
    cpf: 'cpf',
    name: 'John Doe',
    phoneNumber: '1234567890',
    role: 'PATIENT',
};

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

        // Mock PatientRepository behavior to return the created patient
        mockPatientRepository.createPatient.mockResolvedValue(data);

        // Call the createPatient method
        const result = await sut.createPatient(data);
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(data.email);
        // Expect the result to be the created patient
        expect(result.email).toEqual(data.email);
    });

    it('should not create a patient if email is already in use', async () => {
        // Mock PatientRepository behavior to return a patient (indicating email is in use)
        mockPatientRepository.findPatientByEmail.mockResolvedValue(data.email);
        // Call the createPatient method
        await expect(sut.createPatient(data)).rejects.toThrow('Email indisponível');
        // Expect PatientRepository to have been called with the provided email
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(data.email);
        // Expect PatientRepository.create NOT to have been called
        expect(patientRepository.createPatient).not.toHaveBeenCalled();
    });
    it('should not create a patient if CPF is already in use', async () => {
        mockPatientRepository.findPatientByEmail.mockResolvedValue(undefined);
        // Mock PatientRepository behavior to return a patient (indicating email is in use)
        mockPatientRepository.findPatientByCpf.mockResolvedValue(data.cpf);
        // Call the createPatient method
        await expect(sut.createPatient(data)).rejects.toThrow('CPF indisponível');
        // Expect PatientRepository to have been called with the provided email
        expect(patientRepository.findPatientByCpf).toHaveBeenCalledWith(data.cpf);
        // Expect PatientRepository.create NOT to have been called
        expect(patientRepository.createPatient).not.toHaveBeenCalled();
    });
});
