import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Empresa } from '../../users/entities/empresa.entity';
import { User } from '../../users/entities/user.entity';
@Entity('ventas')
export class Venta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    total_venta: number;

    @CreateDateColumn()
    fecha_venta: Date;

    @Column({ default: 'completada' })
    estado: string;

    @ManyToOne(() => Empresa)
    id_empresa: Empresa;

    @ManyToOne(() => User)
    id_usuario: User;
}