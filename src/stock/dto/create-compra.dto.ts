export class CreateCompraDto {
    id_proveedor: number;
    id_usuario: number;
    id_empresa?: number;
    total_compra: number;
    estado?: string;
}