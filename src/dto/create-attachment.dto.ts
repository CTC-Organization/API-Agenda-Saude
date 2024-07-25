import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { Request } from '@prisma/client';

export class CreateAttachmentDto{

    @IsNotEmpty()
    request: Request;

    @IsString()
    @IsNotEmpty()
    requestId: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    url: string;
}