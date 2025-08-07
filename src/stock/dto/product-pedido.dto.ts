interface ProductoPendienteDto {
    id_producto: number;
    nombre?: string;
    cantidad_total: number;
    estado?: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado';
    pedido_id?: number;
    is_combo?: boolean;
}