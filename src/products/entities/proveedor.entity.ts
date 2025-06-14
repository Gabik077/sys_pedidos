import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
    OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('proveedores')
@Unique(['email'])
@Unique(['nombre'])
export class Proveedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100, nullable: true })
    contacto?: string;

    @Column({ length: 100, nullable: true })
    email?: string;

    @Column({ length: 20, nullable: true })
    telefono?: string;

    @Column({ type: 'text', nullable: true })
    direccion?: string;

    @CreateDateColumn({ name: 'fecha_registro', type: 'timestamp' })
    fechaRegistro: Date;

    @Column()
    id_empresa: number;


    @Column({ name: 'id_empresa' })
    empresa: number;

    @Column({ length: 30, nullable: true })
    ruc?: string;

    @OneToMany(() => Product, (product) => product.proveedor)
    products: Product[];
}
