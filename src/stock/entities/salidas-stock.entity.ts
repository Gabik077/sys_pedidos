import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { SalidaStockGeneral } from './salida-stock-general.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('salidas_stock')
export class SalidaStock {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SalidaStockGeneral, salidaGeneral => salidaGeneral.salidas, { onDelete: 'CASCADE' })
    salida_general: SalidaStockGeneral;

    @ManyToOne(() => Product)
    id_producto: Product;

    @Column()
    cantidad: number;

    @CreateDateColumn()
    fecha_salida: Date;

    @ManyToOne(() => User)
    id_usuario: User;
}