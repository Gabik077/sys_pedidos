// src/entities/unidad.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity('unidad_medida')
export class UnidadMedida {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @Column({ type: 'varchar', length: 10 })
    simbolo: string;

    @OneToMany(() => Product, (product) => product.unidad)
    products: Product[];
}
