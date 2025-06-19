import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('empresa')
export class Empresa {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 255, nullable: true })
    direccion: string;

    @Column({ length: 20, nullable: true })
    telefono: string;

    @Column({ length: 100, nullable: true })
    email: string;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    fecha_registro: Date;

    @Column({ length: 20, unique: true, nullable: true })
    ruc: string;
}