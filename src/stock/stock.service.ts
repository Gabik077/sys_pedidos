import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { Compra } from './entities/compras.entity';
import { EntradaStockGeneral } from './entities/entrada-stock-general.entity';
import { EntradaStock } from './entities/entradas-stock.entity';
import { Product } from 'src/products/entities/product.entity';
import { DataSource, Repository, In } from 'typeorm';
import { Stock } from './entities/stock.entity.dto';
import { SalidaStockGeneral } from './entities/salida-stock-general.entity';
import { SalidaStock } from './entities/salidas-stock.entity';
import { StockVentaDto } from './dto/stock-venta.dto';
import { Venta } from './entities/ventas.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MovilPedido } from './entities/movil-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { CrearPedidoDto } from './dto/create-pedido.dto';
import { EnvioPedido } from './entities/envio-pedido.entity';
import { EnviosHeader } from './entities/envios-header.entity';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { EstadoEnvioDto } from './dto/estado-envio.dto';
import { env } from 'process';
import { CreateMovilDto } from './dto/create-movil.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(EnviosHeader)
    private headerRepo: Repository<EnviosHeader>,
    @InjectRepository(EnvioPedido)
    private detalleRepo: Repository<EnvioPedido>,
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    @InjectRepository(MovilPedido)
    private movilRepository: Repository<MovilPedido>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    private readonly dataSource: DataSource,
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

  async getMovilById(id: number): Promise<MovilPedido> {
    const movil = await this.movilRepository.findOneBy({ id });
    if (!movil) {
      throw new Error(`Movil with ID ${id} not found`);
    }
    return movil;
  }

  async createMovil(movil: CreateMovilDto) {
    try {
      const existingMovil = await this.movilRepository.findOneBy({
        nombreMovil: movil.nombreMovil,
      });
      if (existingMovil) {
        throw new Error(`Movil with name ${movil.nombreMovil} already exists`);
      }
      const newMovil = this.movilRepository.create({
        nombreChofer: movil.nombreChofer,
        chapaMovil: movil.chapaMovil,
        nombreMovil: movil.nombreMovil,
        telefonoChofer: movil.telefonoChofer,
        tipoMovil: movil.tipoMovil || 'camion',
      });

      await this.movilRepository.save(newMovil);

      return { status: 'ok', message: 'Movil creado con éxito' };
    } catch (error) {
      return { status: 'error', message: `Error al crear movil: ${error.message}` };
    }

  }

  async editMovil(id: number, movil: CreateMovilDto) {
    const existingMovil = await this.movilRepository.findOneBy({ id });
    if (!existingMovil) {
      throw new Error(`Movil with ID ${id} not found`);
    }
    try {
      const updatedMovil = Object.assign(existingMovil, movil);
      await this.movilRepository.save(updatedMovil)
    } catch (error) {
      return { status: 'error', message: `Error al editar movil: ${error.message}` };
    }

    return { status: 'ok', message: 'Movil actualizado con éxito' };
  }

  async deleteMovil(id: number) {
    const movil = await this.movilRepository.findOneBy({ id });
    if (!movil) {
      throw new Error(`Movil with ID ${id} not found`);
    }
    try {
      await this.movilRepository.delete(id);
      return { status: 'ok', message: 'Movil eliminado con éxito' };
    } catch (error) {
      return { status: 'error', message: `Error al eliminar movil: ${error.message}` };
    }
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

  async getPedidosPorEstado(estadoPedido: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado'): Promise<Pedido[]> {
    return this.pedidoRepository.find({
      where: { estado: estadoPedido }, // Filtrar solo pedidos pendientes
      relations: ['cliente', 'detalles', 'detalles.producto'],
      order: {
        fechaPedido: 'DESC',
      },
      take: 200, // Limitar a los últimos 50 pedidos
    });
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
        cantidad_reservada: true,
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

  async getEnviosPorEstado(estadoEnvio: String): Promise<EnviosHeader[]> {
    return this.headerRepo.find({
      where: { estado: estadoEnvio }, // Filtrar solo envíos pendientes
      relations: ['envioPedido', 'envioPedido.movil', 'envioPedido.pedido', 'envioPedido.pedido.cliente', 'envioPedido.pedido.detalles', 'envioPedido.pedido.detalles.producto'],
      order: {
        fechaCreacion: 'DESC',
      },
      take: 50, // Limitar a los últimos 100 envíos
    });
  }

  async crearEnvio(dto: CreateEnvioDto, idEmpresa: number, idUsuario: number) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (!dto.pedidos || dto.pedidos.length === 0) {
        return { status: 'error', message: 'No se han seleccionado pedidos para el envío' };

      }

      if (!dto.idMovil || dto.idMovil <= 0) {
        return { status: 'error', message: 'Debe seleccionar un móvil válido para el envío' };

      }

      // 1. Crear encabezado
      const header = this.headerRepo.create({
        estado: 'pendiente',
        inicioRutaLat: dto.origenLat ? parseFloat(dto.origenLat.toString()) : 0.0, // Puede ser 0 si no se calcula
        inicioRutaLon: dto.origenLon ? parseFloat(dto.origenLon.toString()) : 0.0, // Puede ser 0 si no se calcula
        finRutaLat: dto.destinoLat ? parseFloat(dto.destinoLat.toString()) : 0.0, // Puede ser 0 si no se calcula
        finRutaLon: dto.destinoLon ? parseFloat(dto.destinoLon.toString()) : 0.0, // Puede ser 0 si no se calcula
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        idUsuario: idUsuario,
        kmCalculado: dto.kmCalculado || null, // Puede ser null si no se calcula
        tiempoCalculado: dto.tiempoCalculado || null, // Puede ser null si
      });

      const savedHeader = await queryRunner.manager.save(header);

      // 2. Crear detalle
      const detalles = dto.pedidos.map((idPedido, index) =>
        this.detalleRepo.create({
          idPedido: idPedido,
          idMovil: dto.idMovil,
          fechaCreacion: new Date(),
          ordenEnvio: index + 1,
          envioHeader: savedHeader,
        }),
      );

      await queryRunner.manager.save(detalles);

      // 3. Actualizar pedidos
      for (const idPedido of dto.pedidos) {
        const pedido = await queryRunner.manager.findOne(Pedido, {
          where: { id: idPedido, estado: 'pendiente' },
          relations: ['cliente'],
        });

        if (!pedido) {
          throw new Error(`Pedido con ID ${idPedido} no encontrado`);
        }

        pedido.estado = 'envio_creado';
        await queryRunner.manager.save(pedido);
      }

      // ✅ Commit si todo fue exitoso
      await queryRunner.commitTransaction();

      return { status: 'ok', message: 'Envío creado con éxito' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al crear el envío:', error);
      return { status: 'error', message: 'Error al crear el envío' };
    } finally {
      await queryRunner.release();
    }
  }

  async guardarEstadoPedido(
    dto: EstadoEnvioDto,
    idEmpresa: number,
    idUsuario: number
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Cargar encabezado del envío con pedidos, detalles y productos
      // 1. Hacer lock sobre el envío (tabla principal)
      const envio = await queryRunner.manager
        .getRepository(EnviosHeader)
        .createQueryBuilder("envio")
        .setLock("pessimistic_write")
        .where("envio.id = :id", { id: dto.id_envio })
        .getOne();

      if (!envio) throw new Error(`No se encontró el envío con ID ${dto.id_envio}`);

      // 1.1. Cargar relaciones aparte sin lock
      envio.envioPedido = await queryRunner.manager.find(EnvioPedido, {
        where: { envioHeader: { id: envio.id } },
        relations: ['pedido', 'pedido.detalles', 'pedido.detalles.producto'],
      });

      // 2. Preparar salida_stock_general si es entregado
      let savedSalidaGeneral = null;
      if (dto.estado === 'entregado') {
        const salidaGeneral = queryRunner.manager.create(SalidaStockGeneral, {
          tipo_origen: 'pedido',
          id_usuario: { id: idUsuario },
          id_empresa: idEmpresa ? { id: idEmpresa } : null,
          observaciones: dto.observaciones || '',
        });
        savedSalidaGeneral = await queryRunner.manager.save(salidaGeneral);
      }

      // 3. Obtener todos los productos en un solo query
      const productoIds = new Set<number>();
      envio.envioPedido.forEach(ep => {
        ep.pedido.detalles.forEach(det => productoIds.add(det.producto.id));
      });

      const stocks = await queryRunner.manager
        .getRepository(Stock)
        .createQueryBuilder("stock")
        .setLock("pessimistic_write")
        .leftJoinAndSelect("stock.producto", "producto")
        .where("producto.id IN (:...ids)", { ids: [...productoIds] })
        .getMany();

      const stockMap = new Map(stocks.map(s => [s.producto.id, s]));

      // 4. Procesar cada pedido y detalle
      for (const ep of envio.envioPedido) {
        const pedido = ep.pedido;

        if (dto.estado === 'entregado') {
          if (!pedido.idCliente) throw new Error(`Pedido ${pedido.id} no tiene cliente asociado`);

          const venta = queryRunner.manager.create(Venta, {
            id_cliente: pedido.idCliente,
            total_venta: pedido.total,
            estado: 'completada',
            metodo_pago: dto.metodo_pago || 'efectivo',
            id_empresa: { id: idEmpresa },
            id_usuario: { id: idUsuario },
            salida_stock_general: savedSalidaGeneral,
            iva: parseFloat((pedido.total / 11).toFixed(2)),
          });
          await queryRunner.manager.save(venta);
        }

        for (const detalle of pedido.detalles) {
          const stock = stockMap.get(detalle.producto.id);

          if (dto.estado === 'entregado') {
            if (!stock || stock.cantidad_disponible < detalle.cantidad || stock.cantidad_reservada < detalle.cantidad) {
              throw new Error(`Stock insuficiente para producto ${detalle.producto.nombre}`);
            }

            stock.cantidad_disponible -= detalle.cantidad;
            stock.cantidad_reservada -= detalle.cantidad;
            stock.fecha_actualizacion = new Date();
            await queryRunner.manager.save(stock);

            const salidaDetalle = queryRunner.manager.create(SalidaStock, {
              salida_general: savedSalidaGeneral,
              id_pedido: pedido.id,
              id_producto: { id: detalle.producto.id },
              cantidad: detalle.cantidad,
              id_usuario: { id: idUsuario }
            });
            await queryRunner.manager.save(salidaDetalle);

            await queryRunner.manager.update(DetallePedido, detalle.id, { estado: 'entregado' });
          } else if (dto.estado === 'cancelado') {
            if (stock && stock.cantidad_reservada >= detalle.cantidad) {
              stock.cantidad_reservada -= detalle.cantidad;
              stock.fecha_actualizacion = new Date();
              await queryRunner.manager.save(stock);
            }
            await queryRunner.manager.update(DetallePedido, detalle.id, { estado: 'cancelado' });
          }
        }

        pedido.estado = dto.estado;
        await queryRunner.manager.save(pedido);
      }

      // 5. Actualizar estado del encabezado
      envio.estado = dto.estado;
      envio.fechaFinalizacion = new Date();
      await queryRunner.manager.save(envio);

      await queryRunner.commitTransaction();
      return { status: 'ok', message: `Envío ${dto.estado} correctamente.` };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error en transacción de envío:', error);
      return { status: 'error', message: error.message };
    } finally {
      await queryRunner.release();
    }
  }


}
