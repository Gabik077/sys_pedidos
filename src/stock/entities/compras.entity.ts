// src/entities/compras.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Proveedor } from '../../products/entities/proveedor.entity';
import { User } from '../../users/entities/user.entity';
import { Empresa } from '../../users/entities/empresa.entity';

@Entity('compras')
export class Compra {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Proveedor)
    @JoinColumn({ name: 'id_proveedor' })
    id_proveedor: Proveedor;


    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @CreateDateColumn()
    fecha_compra: Date;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    total_compra: number;

    @Column({ default: 'aprobado' })
    estado: 'aprobado' | 'pendiente' | 'rechazado';
}