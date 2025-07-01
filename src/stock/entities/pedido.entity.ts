import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Cliente } from './cliente.entity';
import { DetallePedido } from './detalle-pedido.entity';

@Entity('pedidos')
export class Pedido {
    @PrimaryGeneratedColumn({ name: 'id_pedido' })
    id: number;

    @Column({ name: 'id_cliente' })
    idCliente: number;

    @ManyToOne(() => Cliente)
    @JoinColumn({ name: 'id_cliente' })
    cliente: Cliente;

    @CreateDateColumn({ name: 'fecha_pedido', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaPedido: Date;

    @Column({ type: 'varchar', length: 20 })
    estado: 'pendiente' | 'entregado' | 'cancelado';

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    total: number;

    @Column({ name: 'cliente_nombre', type: 'varchar', length: 50, nullable: true })
    clienteNombre?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    observaciones?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    responsable?: string;

    @Column({ name: 'id_empresa' })
    empresa: number;

    @Column({ name: 'id_usuario', type: 'int' })
    id_usuario: number;

    @OneToMany(() => DetallePedido, (detallePedido) => detallePedido.pedido)
    @JoinColumn({ name: 'id_pedido' })
    detalles: DetallePedido[];

}
