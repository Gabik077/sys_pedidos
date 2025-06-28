import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('detalle_pedidos')
export class DetallePedido {
    @PrimaryGeneratedColumn({ name: 'id_detalle_pedido' })
    id: number;

    @Column({ name: 'id_pedido' })
    idPedido: number;

    @ManyToOne(() => Pedido)
    @JoinColumn({ name: 'id_pedido' })
    pedido: Pedido;

    @Column({ name: 'id_producto' })
    idProducto: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'id_producto' })
    producto: Product;

    @Column({ type: 'int' })
    cantidad: number;

    @Column({ name: 'precio_unitario', type: 'numeric', precision: 10, scale: 2 })
    precioUnitario: number;

    @Column({ type: 'varchar', length: 20 })
    estado: 'reservado' | 'entregado' | 'cancelado';
}
