import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/users/user.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Post()
  create(
    @Body() createClientDto: CreateClientDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number) {
    return this.clientsService.create(createClientDto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Post(':id')
  updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number,
  ): Promise<{ status: string; message: string }> {
    return this.clientsService.updateClient(id, updateClientDto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get('/ciudades')
  async getCiudades(
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number,
  ) {
    return this.clientsService.getCiudades(idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get(':id')
  async getClienteById(
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number,
    @Param('id') id: string) {
    return this.clientsService.getClienteById(+id, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor, Role.SysAdmin)
  @Get()
  async getClientes(
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number,
  ) {
    return this.clientsService.getClientes(idEmpresa, idUsuario);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Delete(':id')
  remove(
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number,
    @Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id, idEmpresa, idUsuario);
  }
}
