import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VendedorService } from './vendedor.service';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../users/user.decorator';

@Controller('vendedor')
export class VendedorController {
  constructor(private readonly vendedorService: VendedorService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Post()
  create(
    @Body() createVendedorDto: CreateVendedorDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.vendedorService.create(createVendedorDto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Get('pedidos-por-vendedor')
  getPedidosPorVendedor(
    @User('id_empresa') idEmpresa: number,
    @Query('fechaInicio') fechaInicio?: Date,
    @Query('fechaFin') fechaFin?: Date
  ) {
    return this.vendedorService.getPedidosPorVendedor(idEmpresa, fechaInicio, fechaFin);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin, Role.Vendedor)
  findAll(@User('id_empresa') idEmpresa: number) {
    return this.vendedorService.findAll(idEmpresa);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  findOne(@Param('id') id: string) {
    return this.vendedorService.findOne(+id);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  update(@Param('id') id: string, @Body() updateVendedorDto: UpdateVendedorDto) {
    return this.vendedorService.update(+id, updateVendedorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  remove(@Param('id') id: string) {
    return this.vendedorService.remove(+id);
  }
}
