
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
    IsString, IsOptional, IsNumber, IsInt, Min, Max, IsIn
} from 'class-validator';
export class UpdateProductDto {

    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsNumber()
    @Min(0)
    precio_compra: number;

    @IsNumber()
    @Min(0)
    precio_venta: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock_minimo?: number;

    @IsOptional()
    @IsString()
    @IsIn(['activo', 'inactivo'])
    estado?: string;

    @IsInt()
    id_moneda: number;

    @IsOptional()
    @IsString()
    codigo_interno?: string;

    @IsOptional()
    @IsInt()
    id_empresa?: number;

    @IsInt()
    unidad: number;

    @IsOptional()
    @IsInt()
    id_categoria?: number;

    @IsInt()
    id_proveedor?: number;

    @IsOptional()
    @IsString()
    marca?: string;

    @IsOptional()
    @IsString()
    codigo_barra?: string;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsInt()
    @IsIn([0, 5, 10])
    iva: number;

    @IsOptional()
    @IsString()
    foto_path?: string;
}
