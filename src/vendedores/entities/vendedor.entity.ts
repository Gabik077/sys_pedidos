import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';


@Entity({ name: 'vendedor' })
export class Vendedor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 30 })
    nombre: string;

    @Column({ length: 30 })
    apellido: string;

    @Column({ length: 15, nullable: true })
    cedula?: string;

    @Column({ length: 30 })
    telefono: string;

    @Column({ type: 'int', default: 0 })
    comision: number;

    @Column({ type: 'int', unique: true, nullable: false })
    id_empresa: number;

    @Column({ type: 'int', unique: true, nullable: false })
    id_usuario: number;

}
