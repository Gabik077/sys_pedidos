import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common/pipes';
import * as compression from 'compression';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.use(compression());
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });


  app.useGlobalPipes(new ValidationPipe({
    // whitelist: true,
    //   forbidNonWhitelisted: true,
    transform: true,
  }));


  app.setGlobalPrefix('api');

  await app.listen(4000);
}
bootstrap();
