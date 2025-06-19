export class CreateSalidaStockGeneralDto {
    tipo_origen: 'venta' | 'ajuste' | 'merma' | 'devolucion_proveedor' | 'otro';
    id_origen?: number;
    observaciones?: string;
    id_usuario: number;
    id_empresa?: number;
}