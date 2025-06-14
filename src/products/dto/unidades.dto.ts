
import {
    IsString, IsInt, IsNumber
} from 'class-validator';

export class UnidadesDto {
    @IsNumber()
    @IsInt()
    id: number;
    @IsString()
    nombre: string;
    @IsString()
    simbolo: string;


}