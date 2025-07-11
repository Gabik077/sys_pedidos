export class CreateEnvioDto {
    idMovil: number;
    pedidos: number[]; // IDs de pedidos a incluir
    kmCalculado?: string; // Opcional, si se calcula la distancia
    tiempoCalculado?: string; // Opcional, si se calcula el tiempo
}
