import { CreateServiceTokenDto } from '../dto/create-service-token.dto';

export abstract class ServiceTokenRepository {
    abstract createServiceToken(createServiceTokenDto: CreateServiceTokenDto): Promise<any>;
    abstract cancelServiceToken(id: string): Promise<any>;
    abstract completeServiceToken(id: string): Promise<any>;
    abstract findServiceTokenById(id: string): Promise<any>;
    abstract listServiceTokensByPatientId(id: string): Promise<any>;
}
