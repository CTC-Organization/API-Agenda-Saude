import { UpdateRequestDto } from '@/dto/update-request.dto';
import { CreateRequestDto } from '../dto/create-request.dto';

export abstract class RequestRepository {
    abstract createRequest(createRequestDto: CreateRequestDto): Promise<any>;
    abstract updateRequest(updateRequestDto: UpdateRequestDto): Promise<any>;
    abstract cancelRequest(id: string): Promise<any>;
    abstract completeRequest(id: string): Promise<any>;
    abstract findRequestById(id: string): Promise<any>;
    abstract listRequestsByPatientId(id: string): Promise<any>;
}