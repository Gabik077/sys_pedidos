import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/users/user.decorator';
import { StockVentaDto } from './dto/stock-venta.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador)
  @Post('entrada')
  async registrarEntradaStock(@Body() dto: CreateStockDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.registrarCompraYEntradaStock(dto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor)
  @Post('salida')
  async registrarSalidaStock(@Body() dto: StockVentaDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number
  ) {
    return this.stockService.registrarVentaYSalidaStock(dto, idEmpresa, idUsuario);
  }

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Comprador)
  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(+id, updateStockDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
