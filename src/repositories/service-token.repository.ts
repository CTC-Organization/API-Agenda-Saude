import { CreateServiceTokenDto } from '../dto/create-service-token.dto';

export abstract class ServiceTokenRepository {
    abstract createServiceToken(createServiceTokenDto: CreateServiceTokenDto): Promise<any>;
    abstract cancelServiceTokenByPatientId(id: string): Promise<any>;
    abstract completeServiceTokenByPatientId(id: string): Promise<any>;
    abstract findServiceTokenById(id: string): Promise<any>;
    abstract findValidServiceTokenByPatientId(id: string): Promise<any>;
    abstract listServiceTokensByPatientId(id: string): Promise<any>;
}
