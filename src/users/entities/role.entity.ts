import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./user.entity";

@Entity("roles")
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 50, nullable: false, default: "VENDEDOR" })
    descripcion: string;

    @OneToMany(() => User, (user) => user.rol)
    usuarios: User[];
}
