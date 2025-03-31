import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async login(username: string, password: string) {

        // Aquí deberías implementar la lógica para verificar las credenciales del usuario

        let user = await this.usersRepository.findOne({
            where: {
                username: username,
                contrasena: password
            }
        });

        if (user) {
            return { status: "ok", message: "Login exitoso", token: "fake-jwt-token" };

        }

        return { status: "error", message: "Credenciales incorrectas", token: "" };
    }

}
