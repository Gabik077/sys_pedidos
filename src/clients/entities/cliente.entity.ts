// src/entities/cliente.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Empresa } from '../../users/entities/empresa.entity';


@Entity('clientes')
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido: string;

    @Column({ length: 20, nullable: true })
    telefono: string;

    @Column({ type: 'text', nullable: true })
    direccion: string;

    @Column({ type: 'text', nullable: true })
    ruc: string;

    @Column({ length: 100, nullable: true })
    correo_electronico: string;

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_registro' })
    fecha_registro: Date;

    @Column({ length: 50, nullable: true })
    ciudad: string;

    @Column({ type: 'float8', default: 0.0 })
    lat: number;

    @Column({ type: 'float8', default: 0.0 })
    lon: number;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;
}
