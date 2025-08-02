import { IsString, IsOptional, IsInt, Length, Min } from 'class-validator';

export class CreateVendedorDto {
    @IsString()
    @Length(1, 30)
    nombre: string;

    @IsString()
    @Length(1, 30)
    apellido: string;

    @IsOptional()
    @IsString()
    @Length(0, 15)
    cedula?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    comision?: number;

}
