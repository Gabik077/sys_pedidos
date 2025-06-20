import { CreateCompraDto } from "./create-compra.dto";

export class CreateStockDto {
    tipo_origen: 'compra' | 'produccion' | 'ajuste' | 'devolucion' | 'otro';
    id_origen?: number;
    observaciones: string;
    productos: { id_producto: number; cantidad: number; }[];
    categoria_stock?: { id: number };
    compra?: CreateCompraDto;
}