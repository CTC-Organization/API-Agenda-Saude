import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { z } from 'zod';

@Injectable()
export class UserService {
    async createUser(createUserDto: CreateUserDto) {
        const schema = z.object({
            email: z.string().email().trim().min(1),
            password: z.string().trim().min(1),
        });

        const userData = schema.parse(createUserDto);
        try {
            console.log(userData);
            return await userData;
        } catch (error) {
            throw new Error(error);
        }
    }

    // findOneUser(id: string) {
    //     if (!id) {
    //         throw new BadRequestException();
    //     }

    //     try {
    //         return await createUserDto;
    //     } catch (error) {
    //         throw new Error(error);
    //     }
    // }
}
