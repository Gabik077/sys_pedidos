import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ComboHeader } from './combo-header.entity';
import { Product } from './product.entity';

@Entity('combo_detalle')
export class ComboDetalle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    cantidad: number;

    @ManyToOne(() => ComboHeader, (header) => header.detalles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_combo_header' })
    comboHeader: ComboHeader;

    @ManyToOne(() => Product, { eager: true })
    @JoinColumn({ name: 'id_producto' })
    producto: Product;
}
