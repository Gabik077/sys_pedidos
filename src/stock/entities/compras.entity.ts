// src/entities/compras.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Proveedor } from '../../products/entities/proveedor.entity';
import { User } from '../../users/entities/user.entity';
import { Empresa } from '../../users/entities/empresa.entity';

@Entity('compras')
export class Compra {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Proveedor)
    id_proveedor: Proveedor;

    @ManyToOne(() => User)
    id_usuario: User;

    @ManyToOne(() => Empresa, { nullable: true })
    id_empresa: Empresa;

    @CreateDateColumn()
    fecha_compra: Date;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    total_compra: number;

    @Column({ default: 'pendiente' })
    estado: string;
}