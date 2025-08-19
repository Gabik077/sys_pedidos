import { Empresa } from 'src/users/entities/empresa.entity';
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('zona_cliente')
@Index(['nombre', 'id_empresa'], { unique: true }) // Define el índice único compuesto
export class ZonaCliente {
    @PrimaryGeneratedColumn('increment', { type: 'smallint' }) // Usamos smallint para el tipo de datos smallserial
    id: number;

    @Column({ type: 'varchar', length: 30, nullable: false })
    nombre: string;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;
}
