import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { StockVentaDto } from './dto/stock-venta.dto';
import { CrearPedidoDto } from './dto/create-pedido.dto';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { EstadoEnvioDto } from './dto/estado-envio.dto';
import { User } from 'src/users/user.decorator';
import { MovilPedido } from './entities/movil-pedido.entity';
import { CreateMovilDto } from './dto/create-movil.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('moviles')
  async getMoviles() {
    return this.stockService.getMoviles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('movil/:id')
  async getMobileById(@Param('id') id: string) {
    return this.stockService.getMovilById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('createMovil')
  async createMovil(@Body() movil: CreateMovilDto) {
    return this.stockService.createMovil(movil);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('editMovil/:id')
  async editMovil(@Param('id') id: string, @Body() movil: CreateMovilDto) {
    return this.stockService.editMovil(+id, movil);
  }

  @Delete('movil/:id')
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  removeMovil(@Param('id') id: string) {
    return this.stockService.deleteMovil(+id);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('getPedidos')
  async getPedidos(@Query('estadoPedido') estadoPedido: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado') {
    return this.stockService.getPedidosPorEstado(estadoPedido);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('getEnvios')
  async getEnvios(@Query('estadoEnvio') estadoEnvio: string) {
    return this.stockService.getEnviosPorEstado(estadoEnvio);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('envio')
  async crearEnvio(@Body() dto: CreateEnvioDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.crearEnvio(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('guardarEstadoPedido')
  async guardarEstadoPedido(
    @Body() dto: EstadoEnvioDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number) {
    return this.stockService.guardarEstadoPedido(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('pedido')
  async registrarPedido(@Body() dto: CrearPedidoDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.crearPedido(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.SysAdmin)
  @Post('entrada')
  async registrarEntradaStock(@Body() dto: CreateStockDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.registrarCompraYEntradaStock(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('salida')
  async registrarSalidaStock(@Body() dto: StockVentaDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.registrarVentaYSalidaStock(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.SysAdmin)
  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.SysAdmin)
  @Get()
  findAll() {
    return this.stockService.findAll();
  }


}
