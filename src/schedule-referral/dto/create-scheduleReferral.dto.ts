import { IsDateString, IsString } from 'class-validator';

export class CreateScheduleReferralDto {
    @IsDateString()
    date: string;
    @IsString()
    patient_id: string;
}
