import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { EntradaStockGeneral } from './entrada-stock-general.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('entradas_stock')
export class EntradaStock {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => EntradaStockGeneral, entradaGeneral => entradaGeneral.entradas, { onDelete: 'CASCADE' })
    entrada_general: EntradaStockGeneral;

    @ManyToOne(() => Product)
    id_producto: Product;

    @Column()
    cantidad: number;

    @CreateDateColumn()
    fecha_entrada: Date;

    @ManyToOne(() => User)
    id_usuario: User;
}