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
        entities: [
          Product,
          UnidadMedida,
          Proveedor
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    StockModule,
    ClientsModule,
  ],

})
export class AppModule { }
