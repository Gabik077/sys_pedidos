import { Venta } from "../entities/ventas.entity";

export class StockVentaDto {
    tipo_origen: 'venta' | 'ajuste' | 'devolucion_proveedor' | 'pedido' | 'otro' | 'salón';
    id_origen?: number;
    observaciones?: string;
    venta?: { id_cliente: number, metodo_pago?: string };
    cliente_nombre?: string;
    total_venta: number;
    iva: number;
    productos: { id_producto: number; cantidad: number; }[]
    envio?: {
        id_envio?: number;
        estado: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado';
        fecha_entrega?: Date;
        metodo_pago?: string;
    };
}