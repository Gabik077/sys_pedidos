import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.enum';
import { User as UserDec } from '../users/user.decorator';
import { CreateLocationDto } from 'src/users/dto/create-location.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Get('roles')
  getRoles(): Promise<RoleDto[]> {


    return this.usersService.getRoles();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SysAdmin)
  @Post()
  create(@Body() createUserDto: CreateUserDto, @UserDec('id_empresa') idEmpresa: number) {
    return this.usersService.create(createUserDto, idEmpresa);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SysAdmin)
  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SysAdmin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SysAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SysAdmin, Role.Admin, Role.Repartidor)
  @Post('create-location')
  async createLocation(@Body() locationDto: CreateLocationDto, @UserDec('movil_id') movilId: number, @UserDec('userId') idUsuario: number, @UserDec('id_empresa') idEmpresa: number) {
    return this.usersService.createLocation(locationDto, idUsuario, movilId, idEmpresa);
  }

}
