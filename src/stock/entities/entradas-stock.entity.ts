import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { EntradaStockGeneral } from './entrada-stock-general.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('entradas_stock')
export class EntradaStock {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => EntradaStockGeneral, entradaGeneral => entradaGeneral.entradas, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_entrada_general' })
    entrada_general: EntradaStockGeneral;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'id_producto' })
    id_producto: Product;

    @Column()
    cantidad: number;

    @CreateDateColumn()
    fecha_entrada: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;
}