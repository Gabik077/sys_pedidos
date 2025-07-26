import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ComboDetalle } from './combo-detalle.entity';
import { Product } from './product.entity';

@Entity('combo_header')
export class ComboHeader {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre_combo', length: 50 })
    nombreCombo: string;

    @Column({ name: 'descripcion_combo', length: 100, nullable: true })
    descripcionCombo?: string;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'id_producto_combo' })
    productoCombo: Product;

    @OneToMany(() => ComboDetalle, (detalle) => detalle.comboHeader, { cascade: true })
    detalles: ComboDetalle[];
}
