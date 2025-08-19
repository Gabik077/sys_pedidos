import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Ciudad } from './entities/ciudad.entity';
import { ZonaCliente } from './entities/zona-cliente';

@Module({
  controllers: [ClientsController],
  providers: [ClientsService],
  imports: [TypeOrmModule.forFeature(
    [
      Cliente,
      Ciudad,
      ZonaCliente
    ]
  )],
})
export class ClientsModule {

}
