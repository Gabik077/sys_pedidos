import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('ciudades')
@Unique(['nombre'])
export class Ciudad {
    @PrimaryGeneratedColumn({ type: 'smallint' })
    id: number;

    @Column({ type: 'varchar', length: 30 })
    nombre: string;
}
