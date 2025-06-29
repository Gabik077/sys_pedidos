import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Compra } from './entities/compras.entity';
import { EntradaStockGeneral } from './entities/entrada-stock-general.entity';
import { EntradaStock } from './entities/entradas-stock.entity';
import { Product } from 'src/products/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { Stock } from './entities/stock.entity.dto';
import { SalidaStockGeneral } from './entities/salida-stock-general.entity';
import { SalidaStock } from './entities/salidas-stock.entity';
import { StockVentaDto } from './dto/stock-venta.dto';
import { Venta } from './entities/ventas.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { stat } from 'fs';
import { MovilPedido } from './entities/movil-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CrearPedidoDto } from './dto/create-pedido.dto';
import { EnvioPedido } from './entities/envio-pedido.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(MovilPedido)
    private movilRepository: Repository<MovilPedido>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(Cliente)
    private clientRepository: Repository<Cliente>,
    private readonly dataSource: DataSource
  ) { }

  async getMoviles(): Promise<MovilPedido[]> {
    return this.movilRepository.find({
      select: {
        id: true,
        nombreChofer: true,
        chapaMovil: true,
        tipoMovil: true,
        nombreMovil: true,
      },
    });
  }

  async getClientes(): Promise<Cliente[]> {
    return this.clientRepository.find({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        ruc: true,
        lat: true,
        lon: true,
        direccion: true,
        ciudad: true,
      },
    });
  }

  async registrarCompraYEntradaStock(
    dto: CreateStockDto,
    idEmpresa: number,
    idUsuario: number
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {

      const entradaGeneral = queryRunner.manager.create(EntradaStockGeneral, { //2-inserta en tabla entrada_general
        tipo_origen: dto.tipo_origen, // compra, pedido, ajuste, etc.
        id_usuario: { id: idUsuario },
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        estado: 'aprobado',
        observaciones: dto.observaciones
      });
      const savedEntradaGeneral = await queryRunner.manager.save(entradaGeneral);


      if (dto.compra) {
        const compra = queryRunner.manager.create(Compra, { // 1-inserta en tabla compra
          id_proveedor: { id: dto.compra.id_proveedor },
          id_usuario: { id: idUsuario },
          id_empresa: idEmpresa ? { id: idEmpresa } : null,
          total_compra: dto.compra.total_compra,
          id_entrada_stock_general: savedEntradaGeneral.id,
          estado: dto.compra.estado || 'aprobado'
        });
        const savedCompra = await queryRunner.manager.save(compra);
        dto.id_origen = savedCompra.id;
      }


      for (const producto of dto.productos) {
        const entrada = queryRunner.manager.create(EntradaStock, {// 3-inserta en tabla entradas_stock
          entrada_general: savedEntradaGeneral,
          id_producto: { id: producto.id_producto } as Product,
          cantidad: producto.cantidad,
          id_usuario: { id: idUsuario },
        });
        await queryRunner.manager.save(entrada);

        let stock = await queryRunner.manager.findOne(Stock, { //4-busca en tabla stock
          where: { producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (stock) {
          stock.cantidad_disponible += producto.cantidad;
          await queryRunner.manager.save(stock);
        } else {
          console.log("No existe stock para el producto, creando nuevo registro", producto.id_producto);
          stock = queryRunner.manager.create(Stock, { // 5- inserta en tabla stock (actualiza cantidad)
            producto: { id: producto.id_producto },
            cantidad_disponible: producto.cantidad,
            id_usuario: { id: idUsuario },
            id_empresa: idEmpresa ? { id: idEmpresa } : null,
            id_categoria_stock: dto.categoria_stock.id || 1,
          });
          await queryRunner.manager.save(stock);
        }
      }

      await queryRunner.commitTransaction();
      return { status: 'ok', message: 'Compra y entrada de stock registrada con éxito' };

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
      const salidaGeneral = queryRunner.manager.create(SalidaStockGeneral, {
        tipo_origen: dto.tipo_origen,
        id_usuario: { id: idUsuario },
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        id_cliente: dto.venta ? dto.venta.id_cliente : null, // puede ser null si no es venta a cliente
        observaciones: dto.observaciones
      });

      const salidaStockGeneral = await queryRunner.manager.save(salidaGeneral); // 2-inserta en tabla salida_general

      if (dto.venta) { //si es venta a un cliente
        const venta = queryRunner.manager.create(Venta, { // 1-inserta en tabla venta
          id_cliente: dto.venta.id_cliente || null, // puede ser null si no es venta a cliente
          total_venta: dto.total_venta,
          estado: 'completada',
          metodo_pago: dto.venta.metodo_pago || 'efectivo', // por defecto efectivo
          id_empresa: { id: idEmpresa },
          id_usuario: { id: idUsuario },
          salida_stock_general: salidaStockGeneral, // No se usa en ventas
          iva: parseFloat((dto.total_venta / 11).toFixed(2)) || 0.00, //IVA Paraguay 10% by default
        });
        const savedVenta = await queryRunner.manager.save(venta);
        dto.id_origen = savedVenta.id;
      }

      for (const producto of dto.productos) {
        const stock = await queryRunner.manager.findOne(Stock, {// 3-busca producto en tabla stock
          where: { producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (!stock || (stock.cantidad_disponible - stock.cantidad_reservada) < producto.cantidad) {
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
      return { status: 'ok', message: 'Salida de stock registrada con éxito' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async crearPedido(dto: CrearPedidoDto, idEmpresa: number, idUsuario: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pedido = new Pedido();
      pedido.idCliente = dto.pedido.id_cliente;
      pedido.estado = dto.pedido.estado;
      pedido.total = dto.total_venta;
      pedido.clienteNombre = dto.pedido.cliente_nombre;
      pedido.observaciones = dto.observaciones;
      pedido.responsable = dto.pedido.chofer;
      pedido.empresa = idEmpresa;
      pedido.id_usuario = idUsuario;

      const pedidoGuardado = await queryRunner.manager.save(Pedido, pedido);

      // Crear envio pedido
      /*  if (dto.pedido.id_movil) {
          const envioPedido = new EnvioPedido();
          envioPedido.idPedido = pedidoGuardado.id;
          envioPedido.idMovil = dto.pedido.id_movil || null;
          envioPedido.estado = 'pendiente';

          await queryRunner.manager.save(EnvioPedido, envioPedido);
        }*/

      for (const producto of dto.productos) {
        const stock = await queryRunner.manager.findOne(Stock, {
          where: { producto: { id: producto.id_producto } },
          relations: ['producto'],
        });

        if (!stock) {
          return {
            status: 'error', message: `No hay stock para el producto ID ${producto.id_producto}`
          };
        }

        if ((stock.cantidad_disponible - stock.cantidad_reservada) < producto.cantidad) {
          return { status: 'error', message: `Stock insuficiente para el producto ID ${producto.id_producto}` };
        }

        // Crear detalle pedido
        const detalle = new DetallePedido();
        detalle.idPedido = pedidoGuardado.id;
        detalle.idProducto = producto.id_producto;
        detalle.cantidad = producto.cantidad;
        detalle.estado = 'reservado';
        detalle.precioUnitario = Number(stock.producto['precio_venta']); // Asume que precio_venta existe

        await queryRunner.manager.save(DetallePedido, detalle);

        // Actualizar stock
        stock.cantidad_reservada += producto.cantidad;
        // stock.cantidad_disponible -= producto.cantidad; // Reservamos el stock hasta que se confirme el pedido, despues se descuenta
        await queryRunner.manager.save(Stock, stock);
      }

      await queryRunner.commitTransaction();
      return { status: 'ok', id_pedido: pedidoGuardado.id };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error al crear el pedido: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  findAll() {

    const stock = this.stockRepository.find({
      relations: { producto: true },
      select: {
        id: true,
        cantidad_disponible: true,

        producto: {
          id: true,
          nombre: true,
          descripcion: true,
          precio_venta: true,
          precio_compra: true,
          codigo_barra: true,
          marca: true,
          codigo_interno: true,
          iva: true,
          unidad: {
            id: true,
            nombre: true,
            simbolo: true,
          },
          proveedor: {
            id: true,
            nombre: true,
          },
        },

      }
    }
    );

    return stock;
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
