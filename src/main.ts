import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir solicitudes desde cualquier origen
  app.enableCors({
    origin: '*',  // Permite solicitudes desde cualquier origen
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATH',  // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization',  // Encabezados permitidos
  });


  await app.listen(4000);
}
bootstrap();
