// src/locations/location.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('locations')
export class LocationModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'float8', default: 0.0 })
    lat: number;

    @Column({ type: 'float8', default: 0.0 })
    lon: number;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'id_usuario', type: 'int' })
    idUsuario: number;

    @Column({ name: 'id_movil', type: 'int' })
    idMovil: number;

    @Column({ name: 'id_empresa', type: 'int' })
    idEmpresa: number;

    @Column({ name: 'datos_envios', type: 'jsonb' })
    datosEnvios: any;
}
