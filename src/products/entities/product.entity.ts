import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UnidadMedida } from './unidad.entity';
import { Proveedor } from './proveedor.entity';

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


    @ManyToOne(() => UnidadMedida, (unidad) => unidad.products, { nullable: false })
    @JoinColumn({ name: "id_unidad" }) // FK en DB
    unidad: UnidadMedida;

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.products, { nullable: false })
    @JoinColumn({ name: "id_proveedor" }) // FK en DB
    proveedor: Proveedor;
}
