export class Stock { }
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
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
    observaciones: string;

    @ManyToOne(() => User)
    id_usuario: User;

    @ManyToOne(() => Empresa, { nullable: true })
    id_empresa: Empresa;

    @OneToMany(() => EntradaStock, entrada => entrada.entrada_general)
    entradas: EntradaStock[];
}
