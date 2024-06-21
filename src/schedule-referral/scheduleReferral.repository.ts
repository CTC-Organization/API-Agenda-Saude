import { ScheduleReferral } from '@prisma/client';
import { CreateScheduleReferralDto } from './dto/create-scheduleReferral.dto';
export abstract class ScheduleReferralRepository {
    abstract create(scheduleReferral: CreateScheduleReferralDto): Promise<ScheduleReferral>;
    abstract findById(id: string): Promise<ScheduleReferral>;
    abstract findByEmail(email: string): Promise<ScheduleReferral | null>;
}
