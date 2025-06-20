import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Compra } from './entities/compras.entity';
import { EntradaStockGeneral } from './entities/entrada-stock-general.entity';
import { EntradaStock } from './entities/entradas-stock.entity';
import { Product } from 'src/products/entities/product.entity';
import { DataSource } from 'typeorm';
import { Stock } from './entities/stock.entity.dto';
import { SalidaStockGeneral } from './entities/salida-stock-general.entity';
import { SalidaStock } from './entities/salidas-stock.entity';
import { StockVentaDto } from './dto/stock-venta.dto';
import { Venta } from './entities/ventas.entity';

@Injectable()
export class StockService {
  constructor(
    private readonly dataSource: DataSource
  ) { }

  async registrarCompraYEntradaStock(
    dto: CreateStockDto,
    idEmpresa: number,
    idUsuario: number
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      if (dto.compra) {
        const compra = queryRunner.manager.create(Compra, { // 1-inserta en tabla compra
          id_proveedor: { id: dto.compra.id_proveedor },
          id_usuario: { id: idUsuario },
          id_empresa: idEmpresa ? { id: idEmpresa } : null,
          total_compra: dto.compra.total_compra,
          estado: dto.compra.estado || 'pendiente'
        });
        const savedCompra = await queryRunner.manager.save(compra);
        dto.id_origen = savedCompra.id;
      }

      const entradaGeneral = queryRunner.manager.create(EntradaStockGeneral, { //2-inserta en tabla entrada_general
        tipo_origen: dto.tipo_origen,
        id_origen: dto.id_origen,
        id_usuario: { id: idUsuario },
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        observaciones: dto.observaciones
      });
      await queryRunner.manager.save(entradaGeneral);

      for (const producto of dto.productos) {
        const entrada = queryRunner.manager.create(EntradaStock, {// 3-inserta en tabla entradas_stock
          entrada_general: entradaGeneral,
          id_producto: { id: producto.id_producto } as Product,
          cantidad: producto.cantidad,
          id_usuario: { id: idUsuario },
        });
        await queryRunner.manager.save(entrada);

        let stock = await queryRunner.manager.findOne(Stock, { //4-busca en tabla stock
          where: { id_producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (stock) {
          stock.cantidad_disponible += producto.cantidad;
          await queryRunner.manager.save(stock);
        } else {
          stock = queryRunner.manager.create(Stock, { // 5- inserta en tabla stock (actualiza cantidad)
            id_producto: { id: producto.id_producto } as Product,
            cantidad_disponible: producto.cantidad,
            id_usuario: { id: idUsuario },
            id_empresa: idEmpresa ? { id: idEmpresa } : null,
            id_categoria_stock: dto.categoria_stock.id || 1,
          });
          await queryRunner.manager.save(stock);
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Entrada de stock registrada con éxito', entradaGeneralId: entradaGeneral.id };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async registrarVentaYSalidaStock(
    dto: StockVentaDto,
    idEmpresa: number,
    idUsuario: number
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      if (dto.venta) { //si es venta a un cliente
        const venta = queryRunner.manager.create(Venta, { // 1-inserta en tabla venta
          id_cliente: dto.venta.id_cliente || null, // puede ser null si no es venta a cliente
          total_venta: dto.total_venta,
          estado: 'completada',
          id_empresa: { id: idEmpresa },
          id_usuario: { id: idUsuario },
          iva: dto.total_venta / 11 || 0.00, //IVA Paraguay
        });
        const savedVenta = await queryRunner.manager.save(venta);
        dto.id_origen = savedVenta.id;
      }

      const salidaGeneral = queryRunner.manager.create(SalidaStockGeneral, {
        tipo_origen: dto.tipo_origen,
        id_origen: dto.id_origen,
        id_usuario: { id: idUsuario },
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        observaciones: dto.observaciones
      });

      await queryRunner.manager.save(salidaGeneral); // 2-inserta en tabla salida_general

      for (const producto of dto.productos) {
        const stock = await queryRunner.manager.findOne(Stock, {// 3-busca producto en tabla stock
          where: { id_producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (!stock || stock.cantidad_disponible < producto.cantidad) {
          return { status: 'error', message: `Stock insuficiente para el producto ID ${producto.id_producto}` };
        }

        stock.cantidad_disponible -= producto.cantidad;
        stock.fecha_actualizacion = new Date();

        await queryRunner.manager.save(stock);// 3-actualiza stock

        const salida = queryRunner.manager.create(SalidaStock, {// 3-inserta en tabla salidas_stock (detalle de salida)
          salida_general: salidaGeneral,
          id_producto: { id: producto.id_producto },
          cantidad: producto.cantidad,
          id_usuario: { id: idUsuario }
        });

        await queryRunner.manager.save(salida);
      }

      await queryRunner.commitTransaction();
      return { mensaje: 'Salida registrada con éxito' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  findAll() {
    return `This action returns all stock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stock`;
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return `This action updates a #${id} stock`;
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
