import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { EnviosHeader } from './envios-header.entity';

@Entity('movil_pedidos')
export class MovilPedido {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre_chofer', type: 'varchar', length: 50 })
    nombreChofer: string;


    @Column({ name: 'chapa_movil', type: 'varchar', length: 20 })
    chapaMovil: string;

    @Unique(['nombreMovil'])
    @Column({ name: 'nombre_movil', type: 'varchar', length: 30 })
    nombreMovil: string;

    @Column({ name: 'telefono_chofer', type: 'varchar', length: 20, nullable: true })
    telefonoChofer?: string;

    @Column({ name: 'tipo_movil', type: 'varchar', length: 30, default: 'camion' })
    tipoMovil: string;


}
