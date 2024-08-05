import { CreateUsfDto } from '@/dto/create-usf.dto';

export abstract class UsfRepository {
    // abstract createUsf(createUsfDto: CreateUsfDto): Promise<any>;
    abstract createUsfList(createUsfDtoList: Array<CreateUsfDto>): Promise<any>;
    // abstract findById(id: string): Promise<any>;
    abstract listByCityHallId(id:string): Promise<any>;

    
}
