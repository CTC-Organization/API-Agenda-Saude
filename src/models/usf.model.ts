import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { HealthDistrict } from './health-district.model';

@Schema({ collection: 'usfs' })
export class Usf extends Document {
    @Prop({ type: Number, required: true, unique: true })
    id: number;

    @Prop({ required: true })
    nome_oficial: string;

    @Prop({ required: true })
    rpa: number;

    @Prop({ required: true })
    microregiao: number;

    @Prop({ required: true })
    cnes: number;

    @Prop({ required: true })
    cod_nat: string;

    @Prop({ required: true })
    tipo_servico: string;

    @Prop({ required: true })
    endereco: string;

    @Prop({ required: true })
    bairro: string;

    @Prop()
    fone: string;

    @Prop({ required: true })
    servico: string;

    @Prop({ required: true })
    especialidade: string;

    @Prop({ required: true })
    como_usar: string;

    @Prop({ required: true })
    horario: string;

    @Prop({ required: true })
    ordem: string;

    @Prop({ required: true })
    latitude: string;

    @Prop({ required: true })
    longitude: number;

    @Prop({ type: Number, required: true })
    distrito_sanitario: number;
}

export const UsfSchema = SchemaFactory.createForClass(Usf);
