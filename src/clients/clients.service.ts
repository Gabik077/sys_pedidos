import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Cliente } from './entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Cliente)
    private clientRepository: Repository<Cliente>,
  ) { }
  async create(createClientDto: CreateClientDto, idEmpresa: number, idUsuario: number) {
    const newClient = this.clientRepository.create({
      nombre: createClientDto.nombre,
      apellido: createClientDto.apellido,
      telefono: createClientDto.telefono,
      ruc: createClientDto.ruc,
      direccion: createClientDto.direccion,
      lat: createClientDto.lat,
      lon: createClientDto.lon,
      ciudad: createClientDto.ciudad,
      correo_electronico: createClientDto.correo_electronico,
      id_empresa: { id: idEmpresa },
      id_usuario: { id: idUsuario },
    });


    const cliente = await this.clientRepository.save(newClient);

    if (!cliente) {
      return { status: 'error', message: 'Error al crear el cliente' };
    }

    return { status: 'success', message: 'Cliente creado exitosamente' };
  }

  async getClienteById(id: number): Promise<Cliente | null> {
    return this.clientRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        ruc: true,
        lat: true,
        lon: true,
        direccion: true,
        ciudad: true,
      },
    });
  }

  async getClientes(): Promise<Cliente[]> {
    return this.clientRepository.find({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        ruc: true,
        lat: true,
        lon: true,
        direccion: true,
        ciudad: true,
      },
    });
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
