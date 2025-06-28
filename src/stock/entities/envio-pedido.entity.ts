import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { MovilPedido } from './movil-pedido.entity';

@Entity('envio_pedidos')
export class EnvioPedido {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ name: 'id_pedido' })
    idPedido: number;

    @ManyToOne(() => Pedido, (pedido) => pedido.id)
    @JoinColumn({ name: 'id_pedido' })
    pedido: Pedido;

    @Column({ name: 'id_movil' })
    idMovil: number;

    @ManyToOne(() => MovilPedido)
    @JoinColumn({ name: 'id_movil' })
    movil: MovilPedido;

    @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'now()' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_entrega', type: 'timestamp', nullable: true })
    fechaEntrega: Date | null;

    @Column({ type: 'varchar', default: 'pendiente' })
    estado: string;
}
