import { Controller, Post, Body } from '@nestjs/common';
import { ScheduleReferralService } from './scheduleReferral.service';
import { CreateScheduleReferralDto } from './dto/create-scheduleReferral.dto';

@Controller('scheduleReferral')
export class ScheduleReferralController {
    constructor(private readonly scheduleReferralService: ScheduleReferralService) {}

    @Post()
    createScheduleReferral(@Body() createScheduleReferralDto: CreateScheduleReferralDto) {
        return this.scheduleReferralService.createScheduleReferral(createScheduleReferralDto);
    }
}
