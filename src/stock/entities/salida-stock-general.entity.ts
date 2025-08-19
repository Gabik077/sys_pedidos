import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SalidaStock } from './salidas-stock.entity';
import { Empresa } from '../../users/entities/empresa.entity';

@Entity('salida_stock_general')
export class SalidaStockGeneral {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipo_origen: 'venta' | 'ajuste' | 'devolucion_proveedor' | 'pedido' | 'otro' | 'salón';

    @Column({ nullable: true })
    id_origen: number;

    @CreateDateColumn()
    fecha: Date;

    @Column({ type: 'int', nullable: true })
    id_cliente: number;

    @Column({ nullable: true })
    observaciones: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @OneToMany(() => SalidaStock, salida => salida.salida_general)
    salidas: SalidaStock[];

}