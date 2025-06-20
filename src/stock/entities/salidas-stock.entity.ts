import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { SalidaStockGeneral } from './salida-stock-general.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('salidas_stock')
export class SalidaStock {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SalidaStockGeneral, salidaGeneral => salidaGeneral.salidas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_salida_general' })
    salida_general: SalidaStockGeneral;


    @ManyToOne(() => Product)
    @JoinColumn({ name: 'id_producto' })
    id_producto: Product;

    @Column()
    cantidad: number;

    @Column()
    observaciones: string;

    @CreateDateColumn()
    fecha_salida: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;
}