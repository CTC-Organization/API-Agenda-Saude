import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '@/dto/create-patient.dto';
import { UpdatePatientDto } from '@/dto/update-patient.dto';
import { ValidateIsUserSelfOrAdmin } from '../commons/guards/validate-self-or-admin.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';

@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post()
    createPatient(@Body() createPatientDto: CreatePatientDto) {
        return this.patientService.createPatient(createPatientDto);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Get(':id')
    getPatientById(@Param('id') id: string) {
        return this.patientService.getPatientById(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Get()
    getPatientByCpf(@Body() cpf: string) {
        return this.patientService.getPatientByEmail(cpf);
    }
    @Get()
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    getPatientByEmail(@Body() email: string) {
        return this.patientService.getPatientByEmail(email);
    }
    @UseGuards(ValidateIsUserSelfOrAdmin)
    @Patch(':id')
    updatePatient(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientService.updatePatient(id, updatePatientDto);
    }
}
