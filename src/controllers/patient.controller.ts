import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
    Patch,
    UseGuards,
    UseInterceptors,
    ParseFilePipe,
    UploadedFiles,
    MaxFileSizeValidator,
    FileTypeValidator,
    UploadedFile,
} from '@nestjs/common';
import { PatientService } from '../services/patient.service';
import { CreatePatientDto } from '@/dto/create-patient.dto';
import { UpdatePatientDto } from '@/dto/update-patient.dto';
import { ValidateIsUserSelfOrAdmin } from '../commons/guards/validate-self-or-admin.guard';
import { AuthGuard } from '../commons/guards/auth.guard';
import { ValidateIsUserSelfOrAdminOrEmployee } from '@/commons/guards/validate-self-or-admin-or-employee.guard';
import { ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Pacientes: patients')
@Controller('patients')
export class PatientController {
    constructor(private readonly patientService: PatientService) {}

    @Post()
    async createPatient(@Body() createPatientDto: CreatePatientDto) {
        return await this.patientService.createPatient(createPatientDto);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @UseGuards(AuthGuard)
    @Get(':id')
    async getPatientById(@Param('id') id: string) {
        return await this.patientService.getPatientById(id);
    }
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    @UseGuards(AuthGuard)
    @Get()
    async getPatientByCpf(@Body() cpf: string) {
        return await this.patientService.getPatientByEmail(cpf);
    }
    @Get()
    @UseGuards(AuthGuard)
    @UseGuards(ValidateIsUserSelfOrAdminOrEmployee)
    async getPatientByEmail(@Body() email: string) {
        return await this.patientService.getPatientByEmail(email);
    }
    @UseGuards(ValidateIsUserSelfOrAdmin)
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Patch(':id')
    async updatePatient(
        @Param('id') id: string,
        @Body() updatePatientDto: UpdatePatientDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                ],
            }),
        )
        file?: Express.Multer.File,
    ) {
        return await this.patientService.updatePatient(id, updatePatientDto, file);
    }
}
