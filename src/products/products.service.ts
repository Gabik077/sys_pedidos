import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }



  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
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
      relations: ['unidad'],
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
        precio_compra: true,
        unidad: {
          id: true,
          nombre: true,
          simbolo: true,
        }
      },
    });
    if (!product) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }

    return product;
  }



  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
