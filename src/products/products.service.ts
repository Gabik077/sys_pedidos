import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UnidadMedida } from './entities/unidad.entity';
import { UnidadesDto } from './dto/unidades.dto';
import { Proveedor } from './entities/proveedor.entity';
import { ComboHeader } from './entities/combo-header.entity';
import { ComboDetalle } from './entities/combo-detalle.entity';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UnidadMedida)
    private unidadesRepository: Repository<UnidadMedida>,
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
    @InjectRepository(ComboHeader)
    private comboHeaderRepo: Repository<ComboHeader>,
    @InjectRepository(ComboDetalle)
    private comboDetalleRepo: Repository<ComboDetalle>,
    private readonly dataSource: DataSource,
  ) { }



  async create(createProductDto: CreateProductDto, id_empresa: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar código interno único
      const existingProduct = await queryRunner.manager.findOne(Product, {
        where: { codigo_interno: createProductDto.codigo_interno, id_empresa },
        select: { id: true },
      });

      if (existingProduct) {
        return {
          status: "error",
          message: "Ya existe un producto con el mismo código interno",
        };
      }

      // 2. Crear producto (sin guardar aún is_combo = true)
      const product = this.productRepository.create({
        ...createProductDto,
        unidad: { id: createProductDto.id_unidad },
        proveedor: { id: createProductDto.id_proveedor },
        id_empresa,
      });

      const savedProduct = await queryRunner.manager.save(product);

      // 3. Si es combo, crear combo_header y combo_detalle
      if (createProductDto.comboData) {
        const { nombre_combo, descripcion_combo, detalles } = createProductDto.comboData;

        // 🔒 Validaciones de combo
        if (!detalles || detalles.length === 0) {
          throw new Error('Debe proporcionar al menos un producto en el combo');
        }

        const productoIds = new Set<number>();

        for (const d of detalles) {
          // 🔁 Repetición de productos
          if (productoIds.has(d.id_producto)) {
            throw new Error(`Producto repetido en el combo: ID ${d.id_producto}`);
          }
          productoIds.add(d.id_producto);

          // 🧠 El producto combo no puede contenerse a sí mismo
          if (d.id_producto === savedProduct.id) {
            throw new Error('El producto combo no puede incluirse a sí mismo como componente');
          }

          // 🔢 Cantidad inválida
          if (d.cantidad <= 0) {
            throw new Error(`Cantidad inválida para el producto con ID ${d.id_producto}`);
          }
        }

        // 3.1 Crear combo_header
        const comboHeader = this.comboHeaderRepo.create({
          nombreCombo: nombre_combo,
          descripcionCombo: descripcion_combo || '',
          productoCombo: savedProduct,
        });

        const savedHeader = await queryRunner.manager.save(comboHeader);

        // 3.2 Crear combo_detalle
        const comboDetalles = detalles.map((d) =>
          this.comboDetalleRepo.create({
            comboHeader: savedHeader,
            producto: { id: d.id_producto },
            cantidad: d.cantidad,
          }),
        );

        await queryRunner.manager.save(comboDetalles);

        // 3.3 Marcar producto como combo
        savedProduct.is_combo = true;
        await queryRunner.manager.save(savedProduct);
      }

      await queryRunner.commitTransaction();

      return {
        status: 'ok',
        message: 'Producto creado exitosamente',
        data: savedProduct,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error al crear producto/combos:', error);
      return {
        status: 'error',
        message: 'Error al crear producto: ' + error.message,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getProveedores(): Promise<Proveedor[]> {

    const proveedores = await this.proveedoresRepository.find({
      select: {
        id: true,
        nombre: true,
      },
    });

    return proveedores;

  }

  async getUnidades(): Promise<UnidadesDto[]> {

    const unidades = await this.unidadesRepository.find({
      select: {
        id: true,
        nombre: true,
        simbolo: true,
      },
    });

    return unidades;


  }

  async findAll(): Promise<Product[]> {

    const product = await this.productRepository.find({
      where: { estado: "activo" },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
        codigo_barra: true,
      },
    });

    return product;
  }



  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      relations: ['unidad', 'proveedor'],
      where: { id },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
        stock_minimo: true,
        estado: true,
        codigo_barra: true,
        marca: true,
        id_moneda: true,
        id_categoria: true,
        id_proveedor: true,
        codigo_interno: true,
        iva: true,
        precio_compra: true,
        unidad: {
          id: true,
          nombre: true,
          simbolo: true,
        },
        proveedor: {
          id: true,
          nombre: true,
        }
      }
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }



  async update(id: number, updateProductDto: UpdateProductDto, id_empresa: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { status: "error", message: "Producto no encontrado" };
    }
    try {
      await this.productRepository.update(id, {
        ...updateProductDto,
        unidad: { id: updateProductDto.unidad }, // <-- importante
        proveedor: { id: updateProductDto.id_proveedor }, // <-- importante
        id_empresa: id_empresa, // Mantener la empresa si no se proporciona
      });

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      return { status: "error", message: "Error al actualizar el producto" };
    }

    return { status: "ok", message: "Producto actualizado exitosamente" };


  }

  async remove(id: number) {
    const user = await this.productRepository.delete(id);

    if (user.affected === 0) {
      return { status: "error", message: "no se pudo borrar el producto" };
    }

    return { status: "ok", message: "borrado exitoso" };
  }
}
