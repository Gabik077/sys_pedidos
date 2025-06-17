import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UnidadMedida } from './entities/unidad.entity';
import { UnidadesDto } from './dto/unidades.dto';
import { Proveedor } from './entities/proveedor.entity';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UnidadMedida)
    private unidadesRepository: Repository<UnidadMedida>,
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) { }



  async create(createProductDto: CreateProductDto) {

    const product = this.productRepository.create({
      ...createProductDto,
      unidad: { id: createProductDto.id_unidad },
      proveedor: { id: createProductDto.id_proveedor },
    });
    await this.productRepository.save(product);

    return { status: "ok", message: "Producto actualizado exitosamente" };
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



  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      return { status: "error", message: "Producto no encontrado" };
    }
    try {
      console.log("Actualizando producto con ID:", id, "Datos:", updateProductDto);
      await this.productRepository.update(id, {
        ...updateProductDto,
        unidad: { id: updateProductDto.unidad }, // <-- importante
      });

    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      return { status: "error", message: "Error al actualizar el producto" };
    }

    return { status: "ok", message: "Producto actualizado exitosamente" };


  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
