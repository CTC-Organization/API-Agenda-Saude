import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Usf } from './usf.model';

@Schema({ collection: 'health_districts' })
export class HealthDistrict extends Document {
    @Prop({ type: Number, required: true, unique: true })
    id: number;

    @Prop({ required: true })
    bairro: string;

    @Prop({ required: true })
    distrito_sanitario: number;

    @Prop({ required: true })
    descricao_distrito: string;

    @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Usf' }])
    usfs: Usf[];
}

export const HealthDistrictSchema = SchemaFactory.createForClass(HealthDistrict);
