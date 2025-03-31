import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Role } from "./role.entity"; // Asegúrate de que la ruta sea correcta

@Entity("usuarios")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100, nullable: false })
    nombre: string;

    @Column({ type: "varchar", length: 50, unique: true, nullable: false })
    username: string;

    @Column({ type: "varchar", length: 100, unique: true, nullable: false })
    email: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    contrasena: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    fecha_registro: Date;

    @ManyToOne(() => Role, (role) => role.id, { nullable: false })
    @JoinColumn({ name: "rol" }) // Define la clave foránea
    rol: Role;
}
