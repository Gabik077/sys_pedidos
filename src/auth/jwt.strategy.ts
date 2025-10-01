// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { log } from 'console';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Extrae el token del header Authorization (Bearer token)
                ExtractJwt.fromAuthHeaderAsBearerToken(),

                // Extrae el token de la cookie, si está presente
                (req) => req?.cookies?.token || null, // lee el token de la cookie
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        // El resultado de esto se inyecta en req.user
        return { userId: payload.sub, username: payload.username, role: payload.role, id_empresa: payload.id_empresa, vendedor_id: payload.vendedor_id };
    }
}
