import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { StockVentaDto } from './dto/stock-venta.dto';
import { CrearPedidoDto } from './dto/create-pedido.dto';
import { CreateEnvioDto } from './dto/create-envio.dto';
import { EstadoEnvioDto } from './dto/estado-envio.dto';
import { User } from '../users/user.decorator';
import { CreateMovilDto } from './dto/create-movil.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido } from './entities/pedido.entity';
import { PedidoSalonDto } from './dto/pedidoSalon.dto';
import { FinalizarPedidoEnvioDto } from './dto/finalizar-pedido-envio.dto';

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


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Delete('movil/:id')
  async removeMovil(@Param('id') id: string) {
    return this.stockService.deleteMovil(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('ventas')
  async getVentas(@User('id_empresa') idEmpresa: number, @Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string) {
    return this.stockService.getVentas(idEmpresa, fechaInicio, fechaFin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('ventas-pedidos')
  getVentasPedidos(@User('id_empresa') idEmpresa: number, @Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string) {
    return this.stockService.getVentasPedidos(idEmpresa, fechaInicio, fechaFin);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('updateEstadoPedido/:idPedido')
  async updateEstadoPedido(@Param('idPedido') idPedido: number, @Body('estado') estado: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado') {
    return this.stockService.updateEstadoPedido(idPedido, estado);
  }

  //finaliza un pedido que fue entregado por un movil y cuando llega al ultimo pedido, finaliza el envio
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Repartidor, Role.SysAdmin)
  @Post('finalizarPedidoYEnvio')
  async finalizarPedidoYEnvio(@Body() dto: FinalizarPedidoEnvioDto, @User('id_empresa') idEmpresa: number, @User('userId') idUsuario: number) {
    return this.stockService.finalizarPedidoYEnvio(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('getPedidos')
  async getPedidos(@Query('estadoPedido') estadoPedido: 'pendiente' | 'entregado' | 'cancelado' | 'envio_creado', @User('vendedor_id') idVendedor: number): Promise<Pedido[]> {
    return this.stockService.getPedidosPorEstado(estadoPedido, idVendedor);
  }

  @Get('getPedido/:id')
  async getPedidoById(@Param('id') id: number) {
    return this.stockService.getPedidoById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('getEnvios')
  async getEnvios(@Query('estadoEnvio') estadoEnvio: string) {
    return this.stockService.getEnviosPorEstado(estadoEnvio);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('getEnvioById')
  async getEnviosById(@Query('estadoEnvio') estadoEnvio: string, @Query('envioId') envioId: number) {
    return this.stockService.getEnviosById(estadoEnvio, envioId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin, Role.Repartidor)
  @Get('getEnviosByMovil')
  async getEnviosByMovil(@Query('estadoEnvio') estadoEnvio: string, @User('movil_id') movilId: number) {
    return this.stockService.getEnviosByMovil(estadoEnvio, movilId);
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
  @Post('editarEnvio/:id')
  async editarEnvio(@Body() dto: CreateEnvioDto, @Param('id') idEnvio: number) {
    return this.stockService.editarEnvio(dto, idEnvio);
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
  @Get('/tipo-venta')
  getTipoVenta(
    @User('id_empresa') idEmpresa: number,
  ): Promise<{ id: number; nombre: string }[]> {
    return this.stockService.getTipoVenta(idEmpresa);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('/tipo-pedido')
  getTipoPedido(
    @User('id_empresa') idEmpresa: number,
  ): Promise<{ id: number; nombre: string }[]> {
    return this.stockService.getTipoPedido(idEmpresa);
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
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('updatePedido/:id')
  async updatePedido(@Param('id') id: number, @Body() dto: UpdatePedidoDto) {
    return this.stockService.updatePedido(id, dto);
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
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Post('finalizar-pedido-salon')
  async finalizarPedidoSalon(
    @Body() dto: PedidoSalonDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.finalizarPedidoSalon(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador, Role.SysAdmin)
  @Get()
  async findAll(
    @User('id_empresa') idEmpresa: number,
  ) {
    return this.stockService.findAll(idEmpresa);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('combo/:id')
  async findComboById(@Param('id') id: string) {
    return this.stockService.findComboById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('productos-en-pedidos-pendientes')
  getProductosEnPedidosPendientesById(@Query('productos') productos: number[]) {
    return this.stockService.getProductosEnPedidosPendientesById(productos);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('pedidos-pendientes')
  async getPedidosPendientes() {
    return this.stockService.getProdPedidosPendientes();
  }

}
