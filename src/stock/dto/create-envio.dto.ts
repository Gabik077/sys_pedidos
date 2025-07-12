export class CreateEnvioDto {
    idMovil: number;
    pedidos: number[]; // IDs de pedidos a incluir
    kmCalculado?: string; // Opcional, si se calcula la distancia
    tiempoCalculado?: string; // Opcional, si se calcula el tiempo
    origenLat?: number; // Latitud de origen
    origenLon?: number; // Longitud de origen
    destinoLat?: number; // Latitud de destino
    destinoLon?: number; // Longitud de destino
}
