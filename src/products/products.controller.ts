import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { UnidadesDto } from './dto/unidades.dto';
import { request } from 'express';
import { User } from '../users/user.decorator';


@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor, Role.SysAdmin)
  @Get('unidades')
  getUnidades(): Promise<UnidadesDto[]> {

    return this.productsService.getUnidades();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @User('id_empresa') idEmpresa: number) {
    return this.productsService.create(createProductDto, idEmpresa);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor, Role.SysAdmin)
  @Get('proveedores')
  getProveedores(
    @User('id_empresa') idEmpresa: number,
  ) {
    return this.productsService.getProveedores(idEmpresa);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.Vendedor, Role.SysAdmin)
  @Get()
  findAll(
    @User('id_empresa') idEmpresa: number,
  ) {
    return this.productsService.findAll(idEmpresa);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('id_empresa') idEmpresa: number) {
    return this.productsService.findOne(+id, idEmpresa);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @User('id_empresa') idEmpresa: number) {
    return this.productsService.update(+id, updateProductDto, idEmpresa);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Delete(':id')
  remove(@Param('id') id: string, @User('id_empresa') idEmpresa: number) {
    return this.productsService.remove(+id, idEmpresa);
  }



}
