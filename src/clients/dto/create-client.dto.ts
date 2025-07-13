// src/clientes/dto/create-client.dto.ts
import {
    IsString,
    IsOptional,
    IsNumber,
    IsNotEmpty,
    MaxLength,
    Min,
    Max,
} from 'class-validator';

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    apellido?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    telefono?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsString()
    @IsOptional()
    ruc?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    ciudad?: string;

    @IsNumber({ maxDecimalPlaces: 15 }, { message: 'Logintud decimal debe ser menor a 15' })
    @Min(-90)
    @Max(90)
    lat: number;

    @IsNumber({ maxDecimalPlaces: 15 }, { message: 'Logintud decimal debe ser menor a 15' })
    @Min(-180)
    @Max(180)
    lon: number;

    @IsNumber()
    @IsOptional()
    id_empresa?: number;

    @IsNumber()
    @IsOptional()
    id_usuario?: number;
}
