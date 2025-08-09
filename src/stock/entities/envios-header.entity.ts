import { Empresa } from '../../users/entities/empresa.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { EnvioPedido } from './envio-pedido.entity';

@Entity('envios_header')
export class EnviosHeader {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp', default: () => 'now()' })
    fechaCreacion: Date;

    @Column({ name: 'fecha_finalizacion', type: 'timestamp', nullable: true })
    fechaFinalizacion?: Date;

    @Column({ type: 'varchar', length: 50, default: 'pendiente' })
    estado: String;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @Column({ name: 'id_usuario', type: 'int' })
    idUsuario: number;

    @Column({ name: 'inicio_ruta_lat', type: 'float' })
    inicioRutaLat: number;

    @Column({ name: 'fin_ruta_lat', type: 'float' })
    finRutaLat: number;

    @Column({ name: 'inicio_ruta_lon', type: 'float' })
    inicioRutaLon: number;

    @Column({ name: 'fin_ruta_lon', type: 'float' })
    finRutaLon: number;

    @OneToMany(() => EnvioPedido, (envio) => envio.envioHeader)
    envioPedido: EnvioPedido[];

    @Column({ name: 'km_calculado', type: 'varchar', nullable: true })
    kmCalculado?: string; // Opcional, si se calcula la distancia

    @Column({ name: 'tiempo_calculado', type: 'varchar', nullable: true })
    tiempoCalculado?: string; // Opcional, si se calcula el tiempo
}