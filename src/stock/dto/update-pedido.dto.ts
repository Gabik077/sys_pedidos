export class UpdatePedidoDto {
    observaciones?: string;
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