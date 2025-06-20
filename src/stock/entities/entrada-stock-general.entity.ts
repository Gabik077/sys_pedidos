
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Empresa } from '../../users/entities/empresa.entity';
import { EntradaStock } from './entradas-stock.entity';

@Entity('entrada_stock_general')
export class EntradaStockGeneral {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipo_origen: 'compra' | 'produccion' | 'ajuste' | 'devolucion' | 'otro';

    @Column({ nullable: true })
    id_origen: number;

    @CreateDateColumn()
    fecha: Date;

    @Column({ nullable: true })
    estado: 'aprobado' | 'pendiente' | 'rechazado';

    @Column({ nullable: true })
    observaciones: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @OneToMany(() => EntradaStock, entrada => entrada.entrada_general)
    entradas: EntradaStock[];
}
