export class CreateCompraDto {
    id_proveedor: number;
    total_compra: number;
    estado?: 'aprobado' | 'pendiente' | 'rechazado';
}