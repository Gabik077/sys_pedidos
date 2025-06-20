import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Empresa } from '../../users/entities/empresa.entity';
import { Product } from '../../products/entities/product.entity';
import { CategoriaStock } from './categoria-stock.entity';

@Entity('stock')
@Unique(['id_producto'])
export class Stock {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id_producto' })
    id_producto: Product;

    @Column({ type: 'int' })
    cantidad_disponible: number;

    @Column({ type: 'int', default: 0 })
    cantidad_reservada: number;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    fecha_actualizacion: Date;

    @ManyToOne(() => Empresa, { nullable: true })
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: User;

    @Column({ type: 'int', default: 0 })
    id_categoria_stock: number;

    /*  @ManyToOne(() => CategoriaStock, (categoria) => categoria.id, { nullable: false })
      @JoinColumn({ name: "id_categoria_stock" }) // Define la clave foránea
      id_categoria_stock: CategoriaStock;*/
}