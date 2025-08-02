import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VendedorService } from './vendedor.service';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { User } from 'src/users/user.decorator';

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

  @Get()
  findAll(@User('id_empresa') idEmpresa: number) {
    return this.vendedorService.findAll(idEmpresa);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendedorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendedorDto: UpdateVendedorDto) {
    return this.vendedorService.update(+id, updateVendedorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendedorService.remove(+id);
  }
}
