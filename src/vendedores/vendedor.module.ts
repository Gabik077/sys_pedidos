import { Module } from '@nestjs/common';
import { VendedorService } from './vendedor.service';
import { VendedorController } from './vendedor.controller';
import { Vendedor } from './entities/vendedor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from 'src/stock/entities/pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendedor, Pedido])],
  controllers: [VendedorController],
  providers: [VendedorService],

})
export class VendedorModule { }
