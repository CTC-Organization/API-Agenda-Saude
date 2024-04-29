import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginInputDto } from './dto/login.dto';
import { AuthType } from './types/auth.type';

@Injectable()
export class AuthService {
    async login(loginDto: LoginInputDto): Promise<AuthType> {
        if (!loginDto) {
            throw new BadRequestException();
        }

        try {
            return { id: 'id123', token: 'accesstoken' };
        } catch (error) {
            throw new Error(error);
        }
    }
}
