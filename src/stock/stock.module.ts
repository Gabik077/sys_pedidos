import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Compra } from './entities/compras.entity';
import { EntradaStockGeneral } from './entities/entrada-stock-general.entity';
import { EntradaStock } from './entities/entradas-stock.entity';
import { Empresa } from '../users/entities/empresa.entity';
import { Stock } from './entities/stock.entity.dto';
import { Venta } from './entities/ventas.entity';
import { SalidaStockGeneral } from './entities/salida-stock-general.entity';
import { SalidaStock } from './entities/salidas-stock.entity';
import { CategoriaStock } from './entities/categoria-stock.entity';
import { Cliente } from '../clients/entities/cliente.entity';
import { MovilPedido } from './entities/movil-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { EnvioPedido } from './entities/envio-pedido.entity';
import { EnviosHeader } from './entities/envios-header.entity';
import { ComboHeader } from '../products/entities/combo-header.entity';
import { ComboDetalle } from '../products/entities/combo-detalle.entity';
import { Vendedor } from '../vendedores/entities/vendedor.entity';
import { TipoVenta } from './entities/tipo-venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature(
    [
      Product,
      Compra,
      Venta,
      SalidaStockGeneral,
      EntradaStockGeneral,
      EntradaStock,
      SalidaStock,
      Stock,
      Empresa,
      CategoriaStock,
      Cliente,
      MovilPedido,
      Pedido,
      DetallePedido,
      EnvioPedido,
      EnviosHeader,
      ComboHeader,
      ComboDetalle,
      Vendedor,
      TipoVenta
    ])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule { }
