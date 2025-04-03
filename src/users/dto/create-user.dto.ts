import { Rol } from "../entities/role.entity";

export class CreateUserDto {
    readonly nombre: string;
    readonly email: string;
    readonly username: string;
    readonly contrasena: string;
    readonly rol: Rol;

}
