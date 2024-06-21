import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScheduleReferralDto } from './dto/create-scheduleReferral.dto';
import { ScheduleReferralRepository } from './scheduleReferral.repository';
import { hash } from 'bcryptjs';
import { excludeFieldsInEntity } from '../utils/exclude-fields';

@Injectable()
export class ScheduleReferralService {
    constructor(private scheduleReferralRepository: ScheduleReferralRepository) {}

    async createScheduleReferral({ email, password }: CreateScheduleReferralDto) {
        if (await this.scheduleReferralRepository.findByEmail(email)) {
            throw new BadRequestException('Email indisponível');
        }

        const passwordHashed = await hash(password, 10);

        const scheduleReferral = await this.scheduleReferralRepository.create({
            email,
            password: passwordHashed,
        });

        excludeFieldsInEntity(scheduleReferral, 'password');

        return scheduleReferral;
    }
}
