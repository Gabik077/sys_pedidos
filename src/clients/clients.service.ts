import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Cliente } from './entities/cliente.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Ciudad } from './entities/ciudad.entity';
import { ZonaCliente } from './entities/zona-cliente';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Cliente)
    private clientRepository: Repository<Cliente>,
    @InjectRepository(Ciudad)
    private ciudadRepository: Repository<Ciudad>,
    @InjectRepository(ZonaCliente)
    private zonaRepository: Repository<ZonaCliente>,
  ) { }


  async getCiudades(idEmpresa: number, idUsuario: number): Promise<Ciudad[]> {
    const ciudades = await this.ciudadRepository.find({
      select: {
        id: true,
        nombre: true,
      },
    });

    if (!ciudades || ciudades.length === 0) {
      return [];
    }

    return ciudades;
  }

  async getZonaCliente(idEmpresa: number): Promise<{ id: number; nombre: string }[]> {
    const zonas = await this.zonaRepository.find({
      select: {
        id: true,
        nombre: true,
      },
      where: {
        id_empresa: { id: idEmpresa },
      },
    });

    return zonas;
  }

  async updateClient(
    id: number,
    updateClientDto: UpdateClientDto,
    idEmpresa: number,
    idUsuario: number,
  ): Promise<{ status: string; message: string }> {

    try {

      const client = await this.clientRepository.findOne({
        where: { id, id_empresa: { id: idEmpresa } },
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
    } catch (error) {
      return { status: 'error', message: `Error al actualizar el cliente: ${error.message}` };
    }


  }

  async create(createClientDto: CreateClientDto, idEmpresa: number, idUsuario: number) {

    try {
      const existingClient = await this.clientRepository.findOne({
        where: { lat: createClientDto.lat, lon: createClientDto.lon },
      });
      if (existingClient) {
        return { status: 'error', message: `El Cliente ${existingClient.nombre} ${existingClient.apellido} ya tiene esa latitud y longitud ` };
      }

      if (createClientDto.zona === 0) {
        return { status: 'error', message: 'Debe seleccionar una zona de cliente' };

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
        zona: { id: createClientDto.zona }, // Asignar la zona del cliente
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

  async getClienteById(id: number, idEmpresa: number, idUsuario: number): Promise<Cliente | null> {
    return this.clientRepository.findOne({
      where: { id, id_empresa: { id: idEmpresa } },
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

  async getClientes(idEmpresa: number, idUsuario: number): Promise<Cliente[]> {

    const clients = await this.clientRepository.find({
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
      where: {
        id_empresa: { id: idEmpresa }
      },
    });

    return clients;
  }



  remove(id: number, idEmpresa: number, idUsuario: number): Promise<{ status: string; message: string }> {
    return this.clientRepository.delete({ id, id_empresa: { id: idEmpresa }, id_usuario: { id: idUsuario } }).then((result) => {
      if (result.affected === 0) {
        return { status: 'error', message: 'Cliente no encontrado' };
      }
      return { status: 'ok', message: 'Cliente eliminado exitosamente' };
    }).catch((error) => {
      return { status: 'error', message: `Error al eliminar cliente: ${error.message}` };
    });
  }
}
