import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Usuários: users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.createUser(createUserDto);
    }
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }
}
