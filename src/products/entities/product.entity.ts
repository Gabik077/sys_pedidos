import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('productos')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion?: string;

    @Column('numeric', { precision: 10, scale: 2 })
    precio_compra: number;

    @Column('numeric', { precision: 10, scale: 2 })
    precio_venta: number;

    @Column({ type: 'int', default: 0 })
    stock_minimo: number;

    @Column({ length: 20, default: 'activo' })
    estado: string;

    @Column()
    id_moneda: number;

    @Column({ length: 50, unique: true, nullable: true })
    codigo_interno?: string;

    @CreateDateColumn({ type: 'timestamp', name: 'fecha_registro' })
    fecha_registro?: Date;

    @Column({ nullable: true })
    id_empresa?: number;

    @Column({ nullable: true })
    id_unidad?: number;

    @Column({ nullable: true })
    id_categoria?: number;

    @Column({ nullable: true })
    id_proveedor?: number;

    @Column({ length: 50, nullable: true })
    marca?: string;

    @Column({ length: 50, nullable: true })
    codigo_barra?: string;

    @Column({ length: 20, nullable: true })
    sku?: string;

    @Column()
    iva: number;

    @Column({ length: 50, nullable: true })
    foto_path?: string;

    // Relaciones (opcional, si defines entidades relacionadas)
    // @ManyToOne(() => CategoriaProducto)
    // @JoinColumn({ name: 'id_categoria' })
    // categoria: CategoriaProducto;
}
