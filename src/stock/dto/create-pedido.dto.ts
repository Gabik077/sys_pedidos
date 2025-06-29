export class CrearPedidoDto {
    tipo_origen: string;
    id_origen: number;
    observaciones?: string;
    total_venta: number;
    iva: number;
    pedido: {
        id_cliente: number;
        cliente_nombre: string;
        estado: 'pendiente' | 'entregado' | 'cancelado';
        chofer: string;
        id_movil?: number;
    };
    productos: {
        id_producto: number;
        cantidad: number;
    }[];
}