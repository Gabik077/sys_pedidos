import { Module } from '@nestjs/common';
import { VendedorService } from './vendedor.service';
import { VendedorController } from './vendedor.controller';
import { Vendedor } from './entities/vendedor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vendedor])],
  controllers: [VendedorController],
  providers: [VendedorService],
})
export class VendedorModule { }
