import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Stock } from './stock.entity.dto';

@Entity('categoria_stock')
export class CategoriaStock {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    descripcion: string;

}