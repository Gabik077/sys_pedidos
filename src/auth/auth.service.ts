import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    async login(username: string, password: string) {
        // Aquí debes validar el usuario con la base de datos
        if (username === "admin" && password === "123") {
            return { status: "ok", message: "Login exitoso", token: "fake-jwt-token" };
        }

        return { status: "error", message: "Credenciales incorrectas", token: "" };
    }

}
