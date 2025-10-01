import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Rol } from "./role.entity"; // Asegúrate de que la ruta sea correcta

@Entity("usuarios")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100, nullable: false })
    nombre: string;

    @Column({ type: "varchar", length: 50, unique: true, nullable: false })
    username: string;

    @Column({ type: 'int', unique: true, nullable: false })//EL PRIMER USUARIO SE CREA POR BASE DE DATOS Y DEBE SER EL ADMINISTRADOR
    id_empresa: number;

    @Column({ type: "varchar", length: 100, unique: true, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    contrasena: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_registro: Date;

    @ManyToOne(() => Rol, (role) => role.id, { nullable: false })
    @JoinColumn({ name: "rol" }) // Define la clave foránea
    rol: Rol;

    @Column({ name: "vendedor_id", type: "int", nullable: true })
    vendedor_id?: number;
}
