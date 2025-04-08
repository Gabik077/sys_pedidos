import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async login(username: string, password: string) {

        const user = await this.usersRepository.findOne({
            where: {
                username: username,
                contrasena: password
            },
            relations: ['rol'],
            select: {
                rol: {
                    descripcion: true
                }
            }
        });
        console.log(user);
        if (user) {

            const payload = { sub: user.id, username: user.username, role: user.rol.descripcion };
            const token = await this.jwtService.sign(payload);
            return { status: "ok", message: "Login exitoso", token: token };

        }



        return { status: "error", message: "Credenciales incorrectas", token: "" };
    }

    verifyToken(token: string) {
        return this.jwtService.verify(token);
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

}
