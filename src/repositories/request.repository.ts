import { ResendRequestDto } from '../dto/resend-request.dto';
import { CreateRequestDto } from '../dto/create-request.dto';
import { CreateRequestWithoutServiceTokenDto } from '@/dto/create-request-without-service-token.dto';
import { AcceptRequestDto } from '@/dto/accept-request.dto';

export abstract class RequestRepository {
    abstract createRequest(
        createRequestDto: CreateRequestDto,
        files?: Array<Express.Multer.File>,
    ): Promise<any>;

    abstract createRequestWithoutServiceToken(
        createRequestWithoutServiceTokenDto: CreateRequestWithoutServiceTokenDto,
        files?: Array<Express.Multer.File>,
    ): Promise<any>;

    abstract resendRequest(
        resendRequestDto: ResendRequestDto,
        files?: Array<Express.Multer.File>,
    ): Promise<any>;

    abstract cancelRequest(id: string): Promise<any>;
    abstract completeRequest(id: string): Promise<any>;
    abstract findRequestById(id: string): Promise<any>;
    abstract listRequestsByPatientId(id: string): Promise<any>;
    abstract listAllRequests(): Promise<any>;
    abstract acceptRequest(requestId: string, acceptRequestDto: AcceptRequestDto): Promise<any>;
    abstract denyRequest(id: string, observation: string): Promise<any>;
    abstract confirmRequest(id: string): Promise<any>;
}
