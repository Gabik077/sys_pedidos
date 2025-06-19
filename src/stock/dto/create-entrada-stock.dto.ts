export class CreateEntradaStockGeneralDto {
    tipo_origen: 'compra' | 'produccion' | 'ajuste' | 'devolucion' | 'otro';
    id_origen?: number;
    observaciones?: string;
    id_usuario: number;
    id_empresa?: number;
}