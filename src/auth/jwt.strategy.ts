// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // lee el token del header Authorization
            ignoreExpiration: false,
            secretOrKey: 'fadsfadf'
        });
    }

    async validate(payload: any) {
        // El resultado de esto se inyecta en el req.user
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }
}
