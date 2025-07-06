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
  @Roles(Role.Admin)
  @Post()
  create(
    @Body() createClientDto: CreateClientDto,
    @User('id_empresa') idEmpresa: number,
    @User('userId') idUsuario: number) {
    return this.clientsService.create(createClientDto, idEmpresa, idUsuario);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
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
  @Roles(Role.Admin, Role.Vendedor)
  @Get(':id')
  async getClienteById(@Param('id') id: string) {
    return this.clientsService.getClienteById(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Vendedor)
  @Get()
  async getClientes() {
    return this.clientsService.getClientes();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }
}
