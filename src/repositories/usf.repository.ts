import { CreateUsfDto } from '@/dto/create-usf.dto';

export abstract class UsfRepository {
    // abstract createUsf(createUsfDto: CreateUsfDto): Promise<any>;
    abstract createUsfList(createUsfDtoList: Array<CreateUsfDto>): Promise<any>;
    // abstract findById(id: string): Promise<any>;
    abstract listUsfsByHealthDistrict(id: number): Promise<any>;
    abstract listUsfs(): Promise<any>;

    abstract findUsfByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any>; // busca baseado no bairro

    abstract findUsfsByCoordenates({
        latitude,
        longitude,
    }: {
        latitude: string;
        longitude: number;
    }): Promise<any>; // busca baseado no bairro
}
