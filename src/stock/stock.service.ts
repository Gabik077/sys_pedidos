import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { Compra } from './entities/compras.entity';
import { EntradaStockGeneral } from './entities/entrada-stock-general.entity';
import { EntradaStock } from './entities/entradas-stock.entity';
import { DataSource, Repository, In, QueryRunner, Code, LessThanOrEqual, Equal } from 'typeorm';
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
import { CreateMovilDto } from './dto/create-movil.dto';
import { ComboHeader } from '../products/entities/combo-header.entity';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Vendedor } from '../vendedores/entities/vendedor.entity';
import { ProductoPendienteDto } from './dto/product-pedido.dto';
import { Product } from '../products/entities/product.entity';
import { Between } from 'typeorm';
import { TipoVenta } from './entities/tipo-venta.entity';
import { TipoPedido } from './entities/tipo-pedido.entity';
import { PedidoSalonDto } from './dto/pedidoSalon.dto';
import { Cliente } from 'src/clients/entities/cliente.entity';

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
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ComboHeader)
    private comboRepository: Repository<ComboHeader>,
    @InjectRepository(Vendedor)
    private vendedorRepository: Repository<Vendedor>,
    @InjectRepository(EnvioPedido)
    private envioPedidoRepo: Repository<EnvioPedido>,
    @InjectRepository(TipoVenta)
    private tipoVentaRepo: Repository<TipoVenta>,
    @InjectRepository(TipoPedido)
    private tipoPedidoRepo: Repository<TipoPedido>,
  ) { }

  async getTipoPedido(idEmpresa: number): Promise<{ id: number; nombre: string }[]> {
    const tiposPedido = await this.tipoPedidoRepo.find({
      select: {
        id: true,
        nombre: true,
      },
      where: {
        empresa: { id: idEmpresa },
      },
      order: {
        id: 'ASC',
      },
    });
    return tiposPedido;
  }

  async getTipoVenta(idEmpresa: number): Promise<{ id: number; nombre: string }[]> {
    const tiposVenta = await this.tipoVentaRepo.find({
      select: {
        id: true,
        nombre: true,
      },
      where: {
        empresa: { id: idEmpresa },
      },
      order: {
        id: 'ASC',
      },
    });

    return tiposVenta;
  }

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

  async getVentasPedidos(idEmpresa: number, fechaInicio: string, fechaFin: string): Promise<{ status: string; message?: string } | Pedido[]> {
    // Fecha de hoy a las 00:00:00
    const startOfDay = new Date(fechaInicio);
    startOfDay.setHours(0, 0, 0, 0);
    // Fecha de hoy a las 23:59:59
    const endOfDay = new Date(fechaFin);
    endOfDay.setHours(23, 59, 59, 999);
    //si ventas fecha inicio y fecha fin son mas de 31 dias
    if (endOfDay.getTime() - startOfDay.getTime() > 31 * 24 * 60 * 60 * 1000) {
      return { status: 'error', message: 'El rango de fechas no puede ser mayor a 31 días' };
    }

    const pedido = await this.pedidoRepository.find({
      where: {
        tipoPedido: { id: 1 },
        empresa: idEmpresa,
        fechaEntrega: Between(startOfDay, endOfDay),
        estado: 'entregado',
      },
      relations: [
        'detalles',
        'detalles.producto',
        'cliente',
        'tipoPedido'
      ],
      order: {
        id: 'DESC',
      },
    });


    return pedido;
  }
  //VENTAS DE SALON
  async getVentas(idEmpresa: number, fechaInicio: string, fechaFin: string): Promise<{ status: string; message?: string } | Venta[]> {
    // Fecha de hoy a las 00:00:00
    const startOfDay = new Date(fechaInicio);
    startOfDay.setHours(0, 0, 0, 0);

    // Fecha de hoy a las 23:59:59
    const endOfDay = new Date(fechaFin);
    endOfDay.setHours(23, 59, 59, 999);

    //si ventas fecha inicio y fecha fin son mas de 31 dias
    if (endOfDay.getTime() - startOfDay.getTime() > 31 * 24 * 60 * 60 * 1000) {
      return { status: 'error', message: 'El rango de fechas no puede ser mayor a 31 días' };
    }

    return this.dataSource.getRepository(Venta).find({
      where: {
        id_empresa: { id: idEmpresa },
        fecha_venta: Between(startOfDay, endOfDay),
        tipo_venta: In(['salón', 'venta', 'facturacion']), // Filtrar solo ventas normales
      },
      relations: [
        'salida_stock_general',
        'salida_stock_general.salidas',
        'salida_stock_general.salidas.producto',
        'cliente',
      ],
      order: {
        id: 'DESC'
      }
    });
  }

  async updateEstadoPedido(idPedido: number, estado: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado') {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pedido = await queryRunner.manager.findOne(Pedido, { where: { id: idPedido } });
      if (!pedido) {
        throw new Error(`Pedido con ID ${idPedido} no encontrado`);
      }

      pedido.estado = estado;
      await queryRunner.manager.save(pedido);

      await queryRunner.commitTransaction();
      return { status: 'ok', message: 'Estado del pedido actualizado con éxito' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

  }



  async registrarCompraYEntradaStock(
    dto: CreateStockDto,
    idEmpresa: number,
    idUsuario: number
  ) {

    if (dto.productos.length === 0) {
      return { status: 'error', message: 'Debe agregar al menos un producto' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {

      const entradaGeneral = queryRunner.manager.create(EntradaStockGeneral, { //2-inserta en tabla entrada_general
        tipo_origen: dto.tipo_origen, // compra, pedido, ajuste, etc.
        id_usuario: { id: idUsuario },
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        estado: 'aprobado',
        fecha: new Date(),
        observaciones: dto.observaciones
      });
      const savedEntradaGeneral = await queryRunner.manager.save(entradaGeneral);


      if (dto.compra) {
        const compra = queryRunner.manager.create(Compra, { // 1-inserta en tabla compra
          id_proveedor: { id: dto.compra.id_proveedor },
          id_usuario: { id: idUsuario },
          id_empresa: idEmpresa ? { id: idEmpresa } : null,
          fecha_compra: new Date(),
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
          fecha_entrada: new Date(),
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
          stock = queryRunner.manager.create(Stock, { // 5- inserta en tabla stock (actualiza cantidad)
            producto: { id: producto.id_producto },
            cantidad_disponible: producto.cantidad,
            fecha_actualizacion: new Date(),
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

    if (dto.venta && dto.venta.id_cliente && dto.venta.id_cliente === 0) {
      dto.venta.id_cliente = null;
    }

    if (dto.productos.length === 0) {
      return { status: 'error', message: 'Debe agregar al menos un producto' };
    }

    if (dto.total_venta <= 0) {
      return { status: 'error', message: 'El total de la venta debe ser mayor a 0' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const salidaGeneral = queryRunner.manager.create(SalidaStockGeneral, {
        tipo_origen: dto.tipo_origen,
        id_usuario: { id: idUsuario },
        fecha: new Date(),
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        id_cliente: dto.venta ? dto.venta.id_cliente : null, // puede ser null si no es venta a cliente
        observaciones: dto.observaciones
      });
      dto.productos = dto.productos.map(p => ({
        id_producto: p.id_producto,
        cantidad: p.cantidad,
      }));

      //obtener ids y cantidad de la tabla productos
      const productosDB = await this.productRepository.find(
        {
          where: { id: In(dto.productos.map(p => p.id_producto)) },
          select: ['id', 'precio_venta'],
        }
      );

      if (productosDB.length !== dto.productos.length) {
        throw new Error('Algunos productos no fueron encontrados en la base de datos');
      }

      // Calcular total multiplicando precio * cantidad
      const totalVenta = dto.productos.reduce((acc, p) => {
        const producto = productosDB.find(prod => prod.id === p.id_producto);
        if (!producto) throw new Error(`Producto ${p.id_producto} no encontrado`);
        return acc + (producto.precio_venta * p.cantidad);
      }, 0);

      if (!totalVenta) {
        throw new Error('No se pudo calcular el total de la venta');
      }

      const salidaStockGeneral = await queryRunner.manager.save(salidaGeneral); // 2-inserta en tabla salida_general

      if (dto.venta) { //si es venta a un cliente
        const venta = queryRunner.manager.create(Venta, { // 1-inserta en tabla venta
          cliente: { id: dto.venta ? dto.venta.id_cliente : null }, // puede ser null si no es venta a cliente
          total_venta: totalVenta, // se calcula en el backend
          estado: 'completada',
          metodo_pago: dto.venta.metodo_pago || 'efectivo', // por defecto efectivo
          id_empresa: { id: idEmpresa },
          fecha_venta: new Date(),
          cliente_nombre: dto.cliente_nombre || null,
          id_usuario: { id: idUsuario },
          tipo_venta: dto.tipo_origen || 'venta', // por defecto normal
          salida_stock_general: salidaStockGeneral, // No se usa en ventas
          iva: parseFloat((totalVenta / 11).toFixed(2)) || 0.00, //IVA Paraguay 10% by default
        });
        const savedVenta = await queryRunner.manager.save(venta);
        dto.id_origen = savedVenta.id;
      }

      for (const producto of dto.productos) {
        const stock = await queryRunner.manager.findOne(Stock, {// 3-busca producto en tabla stock
          where: { producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (!stock) {
          throw new Error(`No hay stock para el producto ID ${producto.id_producto}`);
        }
        if (stock.cantidad_disponible < producto.cantidad) {
          throw new Error(`No hay suficiente stock para el producto ID ${producto.id_producto}`);

        }

        stock.cantidad_disponible -= producto.cantidad;
        stock.fecha_actualizacion = new Date();

        await queryRunner.manager.save(stock);// 3-actualiza stock

        const salida = queryRunner.manager.create(SalidaStock, {// 3-inserta en tabla salidas_stock (detalle de salida)
          salida_general: salidaGeneral,
          producto: { id: producto.id_producto },
          fecha_salida: new Date(),
          cantidad: producto.cantidad,
          id_usuario: { id: idUsuario }
        });

        await queryRunner.manager.save(salida);

        // Verificar si es combo
        const productData = await this.productRepository.findOneBy({ id: producto.id_producto });
        if (!productData) {
          throw new Error(`Producto no encontrado`);
        }
        if (productData.is_combo) {//buscar combo si es un combo
          const combo = await this.findComboById(productData.id);
          //extraer productos del combo
          for (const comboDetalle of combo.detalles) {
            await this.restarStockProducto(queryRunner, comboDetalle.producto.id, comboDetalle.cantidad, comboDetalle.producto.nombre);
          }
        }
      }

      await queryRunner.commitTransaction();
      return { status: 'ok', message: 'Salida de stock registrada con éxito' };

    } catch (error) {
      console.error('Error al registrar venta y salida de stock:', error);
      await queryRunner.rollbackTransaction();
      return { status: 'error', message: `Error stock: ${error.message}` };
    } finally {
      await queryRunner.release();
    }
  }

  async finalizarPedidoSalon(
    dto: PedidoSalonDto,
    idEmpresa: number,
    idUsuario: number
  ) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {

      //buscar pedido y actualizar estado a entregado
      const pedido = await queryRunner.manager.findOne(Pedido, {
        where: { id: dto.id_pedido },
        relations: ['detalles', 'detalles.producto'],
      });
      if (!pedido) {
        throw new Error(`Pedido con ID ${dto.id_pedido} no encontrado`);
      }
      if (pedido.estado === 'entregado') {
        throw new Error(`El pedido con ID ${dto.id_pedido} ya fue entregado`);
      }


      const salidaGeneral = queryRunner.manager.create(SalidaStockGeneral, {
        tipo_origen: "salón",
        id_usuario: { id: idUsuario },
        fecha: new Date(),
        id_empresa: idEmpresa ? { id: idEmpresa } : null,
        id_cliente: pedido.idCliente || null, // puede ser null si no es venta a cliente
        observaciones: pedido.observaciones || 'Venta desde salón'
      });
      const productosPedido = pedido.detalles.map(p => ({
        id_producto: p.idProducto,
        cantidad: p.cantidad,
      }));

      //obtener ids y cantidad de la tabla productos
      const productosDB = await this.productRepository.find(
        {
          where: { id: In(productosPedido.map(p => p.id_producto)) },
          select: ['id', 'precio_venta'],
        }
      );

      if (productosDB.length !== productosPedido.length) {
        throw new Error('Algunos productos no fueron encontrados en la base de datos');
      }

      // Calcular total multiplicando precio * cantidad
      const totalVenta = productosPedido.reduce((acc, p) => {
        const producto = productosDB.find(prod => prod.id === p.id_producto);
        if (!producto) throw new Error(`Producto ${p.id_producto} no encontrado`);
        return acc + (producto.precio_venta * p.cantidad);
      }, 0);

      if (!totalVenta) {
        throw new Error('No se pudo calcular el total de la venta');
      }

      const salidaStockGeneral = await queryRunner.manager.save(salidaGeneral); // 2-inserta en tabla salida_general


      const venta = queryRunner.manager.create(Venta, { // 1-inserta en tabla venta
        cliente: { id: pedido.idCliente || null }, // puede ser null si no es venta a cliente
        total_venta: totalVenta, // se calcula en el backend
        estado: 'completada',
        metodo_pago: 'efectivo', // por defecto efectivo
        id_empresa: { id: idEmpresa },
        cliente_nombre: pedido.clienteNombre || null,
        fecha_venta: new Date(),
        id_usuario: { id: idUsuario },
        tipo_venta: 'salón', // solo venta de salón
        salida_stock_general: salidaStockGeneral,
        iva: parseFloat((totalVenta / 11).toFixed(2)) || 0.00, //IVA Paraguay 10% by default
      });
      await queryRunner.manager.save(venta);



      for (const producto of productosPedido) {
        const stock = await queryRunner.manager.findOne(Stock, {// 3-busca producto en tabla stock
          where: { producto: { id: producto.id_producto } },
          lock: { mode: 'pessimistic_write' }
        });

        if (!stock) {
          throw new Error(`No hay stock para el producto ID ${producto.id_producto}`);
        }
        if (stock.cantidad_disponible < producto.cantidad) {
          throw new Error(`No hay suficiente stock para el producto ID ${producto.id_producto}`);

        }

        stock.cantidad_disponible -= producto.cantidad;
        stock.fecha_actualizacion = new Date();

        await queryRunner.manager.save(stock);// 3-actualiza stock

        const salida = queryRunner.manager.create(SalidaStock, {// 3-inserta en tabla salidas_stock (detalle de salida)
          salida_general: salidaGeneral,
          producto: { id: producto.id_producto },
          fecha_salida: new Date(),
          cantidad: producto.cantidad,
          id_usuario: { id: idUsuario }
        });

        await queryRunner.manager.save(salida);
      }


      // Actualizar estado del pedido a "entregado"
      pedido.estado = 'entregado';
      pedido.fechaEntrega = new Date();
      await queryRunner.manager.save(pedido);

      await queryRunner.commitTransaction();
      return { status: 'ok', message: 'Salida de stock registrada con éxito' };

    } catch (error) {
      console.error('Error al finalizar pedido salón:', error);
      await queryRunner.rollbackTransaction();
      return { status: 'error', message: `Error stock: ${error.message}` };
    } finally {
      await queryRunner.release();
    }
  }

  async getPedidosPorEstado(estadoPedido: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado'): Promise<Pedido[]> {
    const pedidos = await this.pedidoRepository.find({
      where: { estado: estadoPedido }, // Filtrar solo pedidos pendientes
      relations: ['cliente', 'detalles', 'detalles.producto', 'cliente.zona', 'tipoPedido'],
      order: {
        fechaPedido: 'DESC',
      },
      take: 200, // Limitar a los últimos 100 pedidos
    });

    // Ordenar los detalles por nombre del producto
    /*  for (const pedido of pedidos) {
        pedido.detalles.sort((a, b) => {
          const nombreA = a.producto?.nombre?.toLowerCase() || '';
          const nombreB = b.producto?.nombre?.toLowerCase() || '';
          return nombreA.localeCompare(nombreB);
        });
      }*/

    // Ordenar detalle por orden
    for (const pedido of pedidos) {
      pedido.detalles.sort((a, b) => a.id - b.id);
    }

    return pedidos;
  }
  async crearPedido(dto: CrearPedidoDto, idEmpresa: number, idUsuario: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      let totalCalculado = 0;

      if (dto.pedido.id_cliente === 0) {
        dto.pedido.id_cliente = null; // Puede ser null si no es venta a cliente

      }

      const productosEnPedidosPendientes = await this.getProductosEnPedidosPendientesById(dto.productos.map(p => p.id_producto));

      // Calcular total con precios reales
      for (const p of dto.productos) {
        const producto = await queryRunner.manager.findOne(Product, {
          where: { id: p.id_producto }
        });

        if (!producto) {
          return {
            status: 'error',
            message: `Producto no encontrado`,
          };
        }

        const precioReal = Number(producto['precio_venta']);
        totalCalculado += precioReal * p.cantidad;
      }

      const vendedor = await this.vendedorRepository.findOneBy({ id: dto.vendedorId });

      // Guardar el pedido
      const pedido = new Pedido();
      pedido.idCliente = dto.pedido.id_cliente || null; // puede ser null si no es venta a cliente
      pedido.estado = dto.pedido.estado;
      pedido.total = totalCalculado; // se calcula en el back
      pedido.clienteNombre = dto.pedido.cliente_nombre;
      pedido.observaciones = dto.observaciones;
      pedido.responsable = dto.pedido.chofer;
      pedido.empresa = idEmpresa;
      pedido.tipoPedido = { id: dto.pedido.tipo_pedido } as TipoPedido; // ID del tipo de pedido
      pedido.id_usuario = idUsuario;
      pedido.fechaPedido = new Date();
      pedido.vendedorId = dto.vendedorId || 1; // default vendedor ID 1
      pedido.vendedorNombre = vendedor ? `${vendedor.nombre} ${vendedor.apellido}` : 'No asignado'; // Nombre del vendedor

      const pedidoGuardado = await queryRunner.manager.save(Pedido, pedido);

      for (const producto of dto.productos) {
        const stock = await queryRunner.manager.findOne(Stock, {
          where: { producto: { id: producto.id_producto } },
          relations: ['producto'],
        });
        //comparar productosEnPedidosPendientes con stock si la cantidad de producto.cantidad + dto.producto.cantidad es mayor a stock.cantidad_disponible
        const productoPendiente = productosEnPedidosPendientes.find(p => p.id_producto === producto.id_producto);
        const productoDtoCantidad = dto.productos.find(p => p.id_producto === producto.id_producto)?.cantidad || 0;
        if (productoPendiente && (productoPendiente.cantidad_total + productoDtoCantidad) > stock.cantidad_disponible) {
          const faltante = (productoPendiente.cantidad_total + productoDtoCantidad) - stock.cantidad_disponible;
          throw new Error(`El producto ${stock.producto.nombre} tiene ${productoPendiente.cantidad_total} pedidos pendientes y el stock actual es ${stock.cantidad_disponible}, faltan ${faltante} más en stock para completar el pedido`);
        }


        if (!stock) {
          throw new Error(`No hay stock para el producto ID ${producto.id_producto}`);
        }

        if (stock.cantidad_disponible < producto.cantidad) {
          throw new Error(`No hay suficiente stock para el producto ${stock.producto.id} - ${stock.producto.nombre}`);
        }

        const precioReal = Number(stock.producto['precio_venta']);

        const detalle = new DetallePedido();
        detalle.idPedido = pedidoGuardado.id;
        detalle.idProducto = producto.id_producto;
        detalle.cantidad = producto.cantidad;
        detalle.estado = 'reservado';
        detalle.precioUnitario = precioReal;

        await queryRunner.manager.save(DetallePedido, detalle);

        // Actualizar stock (NO SE RESERVA MAS EN STOCK, DIRECTAMENTE SE VA CONSULTAR PEDIDOS)
        /* stock.cantidad_reservada += producto.cantidad;
         stock.fecha_actualizacion = new Date();
         await queryRunner.manager.save(Stock, stock);*/

        // Verificar si es combo
        const productData = await this.productRepository.findOneBy({ id: producto.id_producto });
        if (!productData) {
          throw new Error(`Producto no encontrado`);
        }

        if (productData.is_combo) {//verificar stock del combo
          const combo = await this.findComboById(productData.id);
          for (const comboDetalle of combo.detalles) {
            await this.verificarStock(
              queryRunner,
              comboDetalle.producto.id,
              comboDetalle.cantidad,
              comboDetalle.producto.nombre
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      return { status: 'ok', id_pedido: pedidoGuardado.id };
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      await queryRunner.rollbackTransaction();
      return { status: 'error', message: `Error al crear el pedido: ${error.message}` };
    } finally {
      await queryRunner.release();
    }
  }

  async updatePedido(idPedido: number, dto: UpdatePedidoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const pedido = await queryRunner.manager.findOne(Pedido, { where: { id: idPedido } });
      if (!pedido) {
        throw new Error(`Pedido con ID ${idPedido} no encontrado`);
      }
      if (pedido.estado !== 'pendiente') {
        throw new Error(`El pedido con ID ${idPedido} no está en estado pendiente`);
      }

      let totalCalculado = 0;
      const detalles = await queryRunner.manager.find(DetallePedido, {
        where: { idPedido: idPedido },
        relations: ['producto'],
      });
      //merge detalle productos
      for (const detalle of detalles) {
        const productoDto = dto.productos.find(p => p.id_producto === detalle.idProducto);
        if (productoDto) {
          detalle.cantidad = productoDto.cantidad;
          await queryRunner.manager.save(DetallePedido, detalle);
          totalCalculado += detalle.cantidad * detalle.precioUnitario;
        } else {
          // Si el producto no está en el DTO, eliminar el detalle
          await queryRunner.manager.remove(DetallePedido, detalle);
        }
      }
      //agregar nuevos productos en dealles
      for (const producto of dto.productos) {
        const detalleExistente = detalles.find(d => d.idProducto === producto.id_producto);
        if (!detalleExistente) {
          const nuevoDetalle = new DetallePedido();
          nuevoDetalle.idPedido = idPedido;
          nuevoDetalle.idProducto = producto.id_producto;
          nuevoDetalle.cantidad = producto.cantidad;
          nuevoDetalle.estado = 'reservado';

          const product = await queryRunner.manager.findOne(Product, {
            where: { id: producto.id_producto },
          });
          if (!product) {
            throw new Error(`Producto con ID ${producto.id_producto} no encontrado`);
          }

          const stock = await queryRunner.manager.findOne(Stock, {
            where: { producto: { id: producto.id_producto } },
            relations: ['producto'],
          });
          if (!stock) {
            throw new Error(`No hay stock para el producto ID ${producto.id_producto}`);
          }
          if (stock.cantidad_disponible < producto.cantidad) {
            throw new Error(`No hay suficiente stock para el producto ${stock.producto.id} - ${stock.producto.nombre}`);
          }
          nuevoDetalle.precioUnitario = Number(stock.producto['precio_venta']);
          await queryRunner.manager.save(DetallePedido, nuevoDetalle);
          totalCalculado += producto.cantidad * Number(product.precio_venta);
        }

      }

      pedido.observaciones = dto.observaciones;
      pedido.total = totalCalculado;

      await queryRunner.manager.save(Pedido, pedido);

      await queryRunner.commitTransaction();
      return { status: 'ok' };
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      await queryRunner.rollbackTransaction();
      return { status: 'error', message: `Error al actualizar el estado del pedido: ${error.message}` };
    } finally {
      await queryRunner.release();
    }


  }

  async getPedidoById(idPedido: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: idPedido },
      relations: ['cliente', 'detalles', 'detalles.producto'],
    });
    if (!pedido) {
      throw new Error(`Pedido con ID ${idPedido} no encontrado`);
    }
    return pedido;
  }



  findAll(empresaId?: number): Promise<Stock[]> {

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

      },
      where: {
        id_empresa: empresaId ? { id: empresaId } : null,
      }
    }
    );

    return stock;
  }

  async getEnviosById(estadoEnvio: string, envioId: number): Promise<EnviosHeader[]> {

    const envioHeader = await this.headerRepo.findOne({
      where: { id: envioId, estado: estadoEnvio },
    });

    if (!envioHeader) {
      return [];
    }
    const headers = await this.headerRepo
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.envioPedido', 'envioPedido')
      .leftJoinAndSelect('envioPedido.movil', 'movil')
      .leftJoinAndSelect('envioPedido.pedido', 'pedido')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.detalles', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')

      // Si el producto es combo, obtener comboHeader
      .leftJoinAndMapOne(
        'producto.comboHeader',
        'combo_header',
        'combo',
        'combo.productoCombo.id = producto.id'
      )
      // Obtener detalles del combo y los productos
      .leftJoinAndSelect('combo.detalles', 'comboDetalles')
      .leftJoinAndSelect('comboDetalles.producto', 'comboDetalleProducto')

      .where('header.id = :id', { id: envioId })
      .orderBy('header.fechaCreacion', 'DESC')
      .addOrderBy('producto.id_categoria', 'ASC')
      .addOrderBy('producto.nombre', 'ASC')
      .getMany();

    return headers;
  }
  async getEnviosByMovil(estadoEnvio: string, movilId: number): Promise<EnviosHeader[]> {


    const headers = await this.headerRepo
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.envioPedido', 'envioPedido')
      .leftJoinAndSelect('envioPedido.movil', 'movil')
      .leftJoinAndSelect('envioPedido.pedido', 'pedido')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.detalles', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')

      // Si el producto es combo, obtener comboHeader
      .leftJoinAndMapOne(
        'producto.comboHeader',
        'combo_header',
        'combo',
        'combo.productoCombo.id = producto.id'
      )
      // Obtener detalles del combo y los productos
      .leftJoinAndSelect('combo.detalles', 'comboDetalles')
      .leftJoinAndSelect('comboDetalles.producto', 'comboDetalleProducto')
      .where('header.estado = :estado', { estado: estadoEnvio })
      .andWhere('envioPedido.movil.id = :movil', { movil: movilId })
      .orderBy('header.fechaCreacion', 'DESC')
      .addOrderBy('producto.id_categoria', 'ASC')
      .addOrderBy('producto.nombre', 'ASC')
      .getMany();

    return headers;
  }

  async getEnviosPorEstado(estadoEnvio: string): Promise<EnviosHeader[]> {
    const headers = await this.headerRepo
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.envioPedido', 'envioPedido')
      .leftJoinAndSelect('envioPedido.movil', 'movil')
      .leftJoinAndSelect('envioPedido.pedido', 'pedido')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.detalles', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')

      // Si el producto es combo, obtener comboHeader
      .leftJoinAndMapOne(
        'producto.comboHeader',
        'combo_header',
        'combo',
        'combo.productoCombo.id = producto.id'
      )
      // Obtener detalles del combo y los productos
      .leftJoinAndSelect('combo.detalles', 'comboDetalles')
      .leftJoinAndSelect('comboDetalles.producto', 'comboDetalleProducto')

      .where('header.estado = :estado', { estado: estadoEnvio })
      .orderBy('header.fechaCreacion', 'DESC')
      .addOrderBy('producto.id_categoria', 'ASC')
      .addOrderBy('producto.nombre', 'ASC')
      .take(250)
      .getMany();

    return headers;
  }

  async editarEnvio(dto: CreateEnvioDto, idEnvio: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { pedidos, idMovil } = dto;

      if (!pedidos || pedidos.length === 0) {
        return { status: 'error', message: 'No se han seleccionado pedidos para el envío' };
      }

      if (!idMovil || idMovil <= 0) {
        return { status: 'error', message: 'Debe seleccionar un móvil válido para el envío' };
      }

      const envioHeader = await queryRunner.manager.findOne(EnviosHeader, {
        where: { id: idEnvio, estado: 'pendiente' },
        relations: ['envioPedido', 'envioPedido.pedido'],
      });

      if (!envioHeader) {
        return { status: 'error', message: `Envío con ID ${idEnvio} no encontrado` };
      }

      const pedidosExistentes = envioHeader.envioPedido.map(ep => ep.pedido.id);
      const pedidosNuevos = pedidos.filter(id => !pedidosExistentes.includes(id));
      const pedidosAEliminar = pedidosExistentes.filter(id => !pedidos.includes(id));

      // 1. Crear detalles nuevos
      const nuevosDetalles = pedidosNuevos.map((idPedido) =>
        this.detalleRepo.create({
          idPedido,
          idMovil,
          fechaCreacion: new Date(),
          ordenEnvio: pedidos.indexOf(idPedido) + 1,
          envioHeader,
        })
      );
      if (nuevosDetalles.length > 0) {
        await queryRunner.manager.save(nuevosDetalles);
      }
      // 1.1 Actualizar estado de pedidos nuevos a 'envio_creado'
      await queryRunner.manager.update(
        Pedido,
        { id: In(pedidosNuevos) },
        { estado: 'envio_creado' }
      );


      // 2. 🔁 Actualizar orden de TODOS los pedidos del array dto.pedidos (sean nuevos o existentes)
      const detallesAActualizar: EnvioPedido[] = [];

      for (let index = 0; index < pedidos.length; index++) {
        const idPedido = pedidos[index];

        const envioPedidoExistente = envioHeader.envioPedido.find(
          ep => ep.pedido.id === idPedido
        );

        if (envioPedidoExistente && envioPedidoExistente.ordenEnvio !== index + 1) {
          envioPedidoExistente.ordenEnvio = index + 1;
          detallesAActualizar.push(envioPedidoExistente);
        }

      }

      if (detallesAActualizar.length > 0) {
        await queryRunner.manager.save(detallesAActualizar);
      }

      // 3. Restaurar estado de pedidos eliminados
      if (pedidosAEliminar.length > 0) {
        await queryRunner.manager.update(
          Pedido,
          { id: In(pedidosAEliminar), estado: 'envio_creado' },
          { estado: 'pendiente' }
        );

        await queryRunner.manager.delete(EnvioPedido, {
          envioHeader: { id: idEnvio },
          pedido: { id: In(pedidosAEliminar) },
        });
      }

      // ✅ Commit
      await queryRunner.commitTransaction();
      return { status: 'ok', message: 'Envío editado con éxito' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al editar el envío:', error);
      return { status: 'error', message: 'Error al editar el envío' };
    } finally {
      await queryRunner.release();
    }
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
        fechaCreacion: new Date(),
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

      const productosEnPedidosPendientes = await this.getProductosEnPedidosPendientesById([...productoIds]);

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
            cliente: { id: pedido.idCliente },
            total_venta: pedido.total,
            estado: 'completada',
            tipo_venta: 'pedido',
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

            //comparar productosEnPedidosPendientes con stock si la cantidad de producto.cantidad + dto.producto.cantidad es mayor a stock.cantidad_disponible
            const productoPendiente = productosEnPedidosPendientes.find(p => p.id_producto === detalle.producto.id);

            if (productoPendiente && productoPendiente.cantidad_total > stock.cantidad_disponible) {
              const faltante = productoPendiente.cantidad_total - stock.cantidad_disponible;
              throw new Error(`El producto ${stock.producto.nombre} tiene ${productoPendiente.cantidad_total} pedidos pendientes y el stock actual es ${stock.cantidad_disponible}, faltan ${faltante} más en stock para completar el pedido`);
            }


            await this.restarStockProducto(queryRunner, detalle.producto.id, detalle.cantidad, detalle.producto.nombre);

            // Verificar si es combo
            const productData = await this.productRepository.findOneBy({ id: detalle.producto.id });
            if (!productData) {
              throw new Error(`Producto con ID ${detalle.producto.id} no encontrado`);
            }
            if (productData.is_combo) {//buscar combo si es un combo
              const combo = await this.findComboById(productData.id);
              //extraer productos del combo
              for (const comboDetalle of combo.detalles) {
                await this.restarStockProducto(queryRunner, comboDetalle.producto.id, comboDetalle.cantidad, comboDetalle.producto.nombre);
              }
            }

            const salidaDetalle = queryRunner.manager.create(SalidaStock, {
              salida_general: savedSalidaGeneral,
              id_pedido: pedido.id,
              producto: { id: detalle.producto.id },
              cantidad: detalle.cantidad,
              id_usuario: { id: idUsuario }
            });
            await queryRunner.manager.save(salidaDetalle);

            await queryRunner.manager.update(DetallePedido, detalle.id, { estado: 'entregado' });
          } else if (dto.estado === 'cancelado') {
            // if (stock && stock.cantidad_reservada >= detalle.cantidad) {REEMPLAZAR POR CONSULTA A PEDIDOS

            // Verificar si es combo
            const productData = await this.productRepository.findOneBy({ id: detalle.producto.id });
            if (!productData) {
              throw new Error(`Producto con ID ${detalle.producto.id} no encontrado`);
            }
            if (productData.is_combo) {//buscar combo si es un combo
              const combo = await this.findComboById(productData.id);
              //extraer productos del combo
              for (const comboDetalle of combo.detalles) {//verificar stock de cada producto del combo
                await this.verificarStock(queryRunner, comboDetalle.producto.id, comboDetalle.cantidad);
              }
            }
            // }
            await queryRunner.manager.update(DetallePedido, detalle.id, { estado: 'cancelado' });
          }
        }

        pedido.estado = dto.estado;
        pedido.fechaEntrega = new Date();
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

  async findComboById(id: number): Promise<ComboHeader> {
    return this.comboRepository.findOne({
      where: { productoCombo: { id } },
      relations: ['detalles'],
    });
  }

  async restarStockProducto(queryRunner: QueryRunner, idProducto: number, cantidad: number, productoNombre?: string) {
    const stock = await queryRunner.manager.findOne(Stock, {
      where: { producto: { id: idProducto } },
      lock: { mode: 'pessimistic_write' }
    });

    if (!stock || stock.cantidad_disponible < cantidad) {
      throw new Error(`Stock insuficiente para el producto: ${productoNombre}`);
    }

    stock.cantidad_disponible -= cantidad;
    stock.fecha_actualizacion = new Date();
    await queryRunner.manager.save(stock);
  }

  async verificarStock(queryRunner: QueryRunner, idProducto: number, cantidad: number, nombreProducto?: string) {
    const comboStock = await queryRunner.manager.findOne(Stock, {
      where: { producto: { id: idProducto } }
    });

    if (!comboStock || comboStock.cantidad_disponible < cantidad) {
      throw new Error(`Stock insuficiente para el producto del combo: ${nombreProducto}`);
    }
  }
  //agrupa que productos estan en pedidos pendientes (usar antes de crear un pedido o actualizar un pedido)
  async getProductosEnPedidosPendientesById(productos: number[]): Promise<ProductoPendienteDto[]> {
    const resultadoRaw = await this.dataSource
      .getRepository(DetallePedido)
      .createQueryBuilder('dp')
      .select('dp.idProducto', 'id_producto')
      .addSelect('SUM(dp.cantidad)', 'cantidad_total')
      .innerJoin('dp.pedido', 'p')
      .where('p.estado IN (:...estados)', { estados: ['pendiente', 'envio_creado'] })
      .andWhere('dp.idProducto IN (:...ids)', { ids: productos })
      .groupBy('dp.idProducto')
      .getRawMany();


    const resultado: ProductoPendienteDto[] = resultadoRaw.map(r => ({
      id_producto: +r.id_producto,
      cantidad_total: +r.cantidad_total
    }));

    return resultado;

  }

  //agrupa productos en pedidos pendientes con nombres
  async getProdPedidosPendientes(): Promise<ProductoPendienteDto[]> {
    const resultadoRaw = await this.dataSource
      .getRepository(DetallePedido)
      .createQueryBuilder('dp')
      .select('dp.idProducto', 'id_producto')
      .addSelect('p2.nombre', 'nombre')
      .addSelect('SUM(dp.cantidad)', 'cantidad_total')
      .innerJoin('dp.pedido', 'p')
      .innerJoin('productos', 'p2', 'p2.id = dp.idProducto')
      .where('p.estado IN (:...estados)', { estados: ['pendiente', 'envio_creado'] })
      .groupBy('dp.idProducto')
      .addGroupBy('p2.nombre')
      .getRawMany();

    const resultado: ProductoPendienteDto[] = resultadoRaw.map(r => ({
      id_producto: +r.id_producto,
      nombre: r.nombre,
      cantidad_total: +r.cantidad_total
    }));

    return resultado;

  }


}
