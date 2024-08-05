import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {BrazilianState}  from '@prisma/mongodb-client';

export class CreateCityHallDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  state: BrazilianState;
}
