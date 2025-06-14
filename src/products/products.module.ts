import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { UnidadMedida } from './entities/unidad.entity';
import { Proveedor } from './entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, UnidadMedida, Proveedor])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule { }
