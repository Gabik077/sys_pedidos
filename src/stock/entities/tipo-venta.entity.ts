import { Empresa } from 'src/users/entities/empresa.entity';
import { Entity, PrimaryGeneratedColumn, Column, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity('tipo_venta')
@Index(['nombre', 'empresa'], { unique: true }) // Define el índice único compuesto
export class TipoVenta {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 30, nullable: false })
    nombre: string;

    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'empresa' })
    empresa: Empresa;
}