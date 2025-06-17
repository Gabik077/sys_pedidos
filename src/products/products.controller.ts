import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { UnidadesDto } from './dto/unidades.dto';
import { request } from 'express';
import { User } from 'src/users/user.decorator';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor)
  @Get('unidades')
  getUnidades(): Promise<UnidadesDto[]> {

    return this.productsService.getUnidades();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @User('id_empresa') idEmpresa: number) {
    return this.productsService.create(createProductDto, idEmpresa);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor)
  @Get('proveedores')
  getProveedores() {
    return this.productsService.getProveedores();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor)
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User('id_empresa') idEmpresa: number) {
    return this.productsService.update(+id, updateProductDto, idEmpresa);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }



}
