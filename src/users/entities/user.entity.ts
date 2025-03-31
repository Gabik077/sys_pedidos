import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type UserRole = 'admin' | 'vendedor' | 'comprador';

@Entity('usuarios')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 255 })
    contrasena: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro: Date;

    @Column({ default: 'vendedor', type: 'enum', enum: ['admin', 'vendedor', 'comprador'] })
    rol: UserRole;
}
