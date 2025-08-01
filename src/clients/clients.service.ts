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

  async updateClient(
    id: number,
    updateClientDto: UpdateClientDto,
    idEmpresa: number,
    idUsuario: number,
  ): Promise<{ status: string; message: string }> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });
    if (!client) {
      return { status: 'error', message: 'Cliente no encontrado' };
    }
    const updatedClient = this.clientRepository.merge(client, {
      nombre: updateClientDto.nombre,
      apellido: updateClientDto.apellido,
      telefono: updateClientDto.telefono,
      ruc: updateClientDto.ruc,
      direccion: updateClientDto.direccion,
      lat: updateClientDto.lat,
      lon: updateClientDto.lon,
      ciudad: updateClientDto.ciudad,
      email: updateClientDto.email
    });
    const result = await this.clientRepository.save(updatedClient);
    if (!result) {
      return { status: 'error', message: 'Error al actualizar el cliente' };
    }
    return { status: 'ok', message: 'Cliente actualizado exitosamente' };
  }

  async create(createClientDto: CreateClientDto, idEmpresa: number, idUsuario: number) {

    try {
      const existingClient = await this.clientRepository.findOne({
        where: { lat: createClientDto.lat, lon: createClientDto.lon },
      });
      if (existingClient) {
        return { status: 'error', message: `El Cliente ${existingClient.nombre} ${existingClient.apellido} ya tiene esa latitud y longitud ` };
      }

      const newClient = this.clientRepository.create({
        nombre: createClientDto.nombre,
        apellido: createClientDto.apellido,
        telefono: createClientDto.telefono,
        ruc: createClientDto.ruc,
        direccion: createClientDto.direccion,
        lat: createClientDto.lat,
        lon: createClientDto.lon,
        ciudad: createClientDto.ciudad,
        email: createClientDto.email,
        id_empresa: { id: idEmpresa },
        id_usuario: { id: idUsuario },
      });


      const cliente = await this.clientRepository.save(newClient);

      if (!cliente) {
        return { status: 'error', message: 'Error al crear el cliente' };
      }

      return { status: 'ok', message: 'Cliente creado exitosamente' };

    } catch (error) {
      return { status: 'error', message: `Error al crear el cliente: ${error.message}` };

    }


  }

  async getClienteById(id: number): Promise<Cliente | null> {
    return this.clientRepository.findOne({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
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



  remove(id: number) {
    return this.clientRepository.delete(id).then((result) => {
      if (result.affected === 0) {
        return { status: 'error', message: 'Cliente no encontrado' };
      }
      return { status: 'ok', message: 'Cliente eliminado exitosamente' };
    }).catch((error) => {
      return { status: 'error', message: `Error al eliminar cliente: ${error.message}` };
    });
  }
}
