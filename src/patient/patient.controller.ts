import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post()
    createPatient(@Body() createPatientDto: CreatePatientDto) {
        return this.patientService.createPatient(createPatientDto);
    }
    @Get(':id')
    getPatientById(@Param('id') id: string) {
        return this.patientService.getPatientById(id);
    }
    @Get()
    getPatientByCpf(@Body() cpf: string) {
        return this.patientService.getPatientByEmail(cpf);
    }
    @Get()
    getPatientByEmail(@Body() email: string) {
        return this.patientService.getPatientByEmail(email);
    }
    @Put()
    updatePatient(@Body() updatePatientDto: UpdatePatientDto) {
        return this.patientService.updatePatient(updatePatientDto);
    }
}
