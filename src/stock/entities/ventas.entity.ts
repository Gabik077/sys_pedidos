import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Double, JoinColumn } from 'typeorm';
import { Empresa } from '../../users/entities/empresa.entity';
import { User } from '../../users/entities/user.entity';
import { join } from 'path';
import { SalidaStockGeneral } from './salida-stock-general.entity';
import { Cliente } from 'src/clients/entities/cliente.entity';
@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.00 })
    total_venta: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    metodo_pago: string;

    @CreateDateColumn()
    fecha_venta: Date;

    @Column({ default: 'completada' })
    estado: string;

    @ManyToOne(() => SalidaStockGeneral, { nullable: true })
    @JoinColumn({ name: 'id_salida_stock_general' })
    salida_stock_general: SalidaStockGeneral;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.00 })
    iva: Double;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;

    @ManyToOne(() => Cliente, { nullable: true })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Cliente;

    @Column({ type: 'varchar', length: 30, nullable: true })
    tipo_venta: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    cliente_nombre?: string;
}