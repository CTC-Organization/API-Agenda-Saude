import { Test, TestingModule } from '@nestjs/testing';
import { PatientRepository } from '../repositories/patient.repository';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '../dto/create-patient.dto';

const mockPatientRepository = {
    createPatient: jest.fn(),
    findPatientByEmail: jest.fn(),
    // findPatientByCpf: jest.fn(),
};

let patientRepository: PatientRepository;

const data: CreatePatientDto = {
    email: 'email@gmail.com',
    password: 'password',
    cpf: 'cpf',
    name: 'John Doe',
    phoneNumber: '1234567890',
    role: 'PATIENT',
    susNumber: '1231323',
    birthDate: '2000-01-01T00:00:00',
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
        mockPatientRepository.findPatientByEmail.mockResolvedValue(undefined);
        mockPatientRepository.createPatient.mockResolvedValue(data);
        const result = await sut.createPatient(data);
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(data.email);
        expect(result.email).toEqual(data.email);
    });

    it('should not create a patient if email is already in use', async () => {
        mockPatientRepository.findPatientByEmail.mockResolvedValue(data.email);
        await expect(sut.createPatient(data)).rejects.toThrow('Email indisponível');
        expect(patientRepository.findPatientByEmail).toHaveBeenCalledWith(data.email);
        expect(patientRepository.createPatient).not.toHaveBeenCalled();
    });

    // it('should not create a patient if CPF is already in use', async () => {
    //     mockPatientRepository.findPatientByEmail.mockResolvedValue(undefined);
    //     mockPatientRepository.findPatientByCpf.mockResolvedValue(data.cpf);
    //     await expect(sut.createPatient(data)).rejects.toThrow('CPF indisponível');
    //     expect(patientRepository.findPatientByCpf).toHaveBeenCalledWith(data.cpf);
    //     expect(patientRepository.createPatient).not.toHaveBeenCalled();
    // });
});
