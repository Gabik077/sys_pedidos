
export class EstadoEnvioDto {

    id_envio: number;
    estado: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado';
    fecha_entrega?: Date;
    metodo_pago?: string;
    observaciones?: string;

}