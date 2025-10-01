import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async login(username: string, password: string, res: Response) {

        const user = await this.usersRepository.findOne({
            where: {
                username: username
            },
            relations: ['rol'],
            select: {
                rol: {
                    descripcion: true
                }
            }
        });

        if (user) {
            const validPassword = await bcrypt.compare(password, user.contrasena);

            if (validPassword) {
                const payload = { sub: user.id, username: user.username, role: user.rol.descripcion, id_empresa: user.id_empresa, vendedor_id: user.vendedor_id };
                const token = await this.jwtService.sign(payload);
                if (process.env.NODE_ENV !== 'production') {
                    console.log("Token generado:", token);
                }

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/',
                    sameSite: 'lax', // recomendado
                });


                return { status: "ok", message: "Login exitoso", token: token };
            }

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
