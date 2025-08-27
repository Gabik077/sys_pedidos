import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { UnidadMedida } from './products/entities/unidad.entity';
import { Proveedor } from './products/entities/proveedor.entity';
import { StockModule } from './stock/stock.module';
import { ClientsModule } from './clients/clients.module';
import { ComboDetalle } from './products/entities/combo-detalle.entity';
import { ComboHeader } from './products/entities/combo-header.entity';
import { VendedorModule } from './vendedores/vendedor.module';
import { max, min } from 'class-validator';
import { Pedido } from './stock/entities/pedido.entity';
import { Stock } from './stock/entities/stock.entity.dto';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'user'),
        password: config.get<string>('DB_PASS', 'password'),
        database: config.get<string>('DB_NAME', 'test_db'),
        autoLoadEntities: true,
        synchronize: false, // true Solo para desarrollo
        extra: {
          max: 5, // Aumenta el número máximo de conexiones en el pool
          min: 1, // Establece el número mínimo de conexiones en el pool
          idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30 segundos
        },
        entities: [
          Product,
          UnidadMedida,
          Proveedor,
          ComboHeader,
          ComboDetalle,
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    StockModule,
    ClientsModule,
    VendedorModule,
  ],

})
export class AppModule { }
