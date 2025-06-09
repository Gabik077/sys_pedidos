import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }



  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll()
    : Promise<Product[]> {

    const product = await this.productRepository.find({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
      },
    });

    return product;
  }



  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
