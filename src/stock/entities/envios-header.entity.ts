import { Empresa } from 'src/users/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
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
    estado: string;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @Column({ name: 'id_usuario', type: 'int' })
    idUsuario: number;

    @OneToMany(() => EnvioPedido, (envio) => envio.envioHeader)
    envioPedido: EnvioPedido[];
}