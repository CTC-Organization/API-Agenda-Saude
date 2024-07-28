import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards } from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '@/dto/create-patient.dto';
import { UpdatePatientDto } from '@/dto/update-patient.dto';
import { ValidateIsUserSelfOrAdmin } from '../commons/guards/validate-self-or-admin.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pacientes: patients')
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post()
    async createPatient(@Body() createPatientDto: CreatePatientDto) {
        return await this.patientService.createPatient(createPatientDto);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Get(':id')
    async getPatientById(@Param('id') id: string) {
        return await this.patientService.getPatientById(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @Get()
    async getPatientByCpf(@Body() cpf: string) {
        return await this.patientService.getPatientByEmail(cpf);
    }
    @Get()
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async getPatientByEmail(@Body() email: string) {
        return await this.patientService.getPatientByEmail(email);
    }
    @UseGuards(ValidateIsUserSelfOrAdmin)
    @Patch(':id')
    async updatePatient(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return await this.patientService.updatePatient(id, updatePatientDto);
    }
}
