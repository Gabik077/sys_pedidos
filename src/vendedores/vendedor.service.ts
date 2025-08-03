import { Injectable } from '@nestjs/common';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from './entities/vendedor.entity';

@Injectable()
export class VendedorService {
  constructor(
    @InjectRepository(Vendedor)
    private readonly vendedorRepo: Repository<Vendedor>,
  ) { }


  async create(dto: CreateVendedorDto, idEmpresa: number, idUsuario: number): Promise<{ status: string; message: string }> {

    try {
      const vendedor = await this.vendedorRepo.create({
        nombre: dto.nombre,
        apellido: dto.apellido,
        cedula: dto.cedula,
        comision: dto.comision || 0,
        id_empresa: idEmpresa,
        id_usuario: idUsuario,
        telefono: dto.telefono,
      });

      this.vendedorRepo.save(vendedor);

      return { status: 'ok', message: 'Vendedor creado exitosamente' };

    } catch (error) {
      return { status: 'error', message: `Error al crear el vendedor: ${error.message}` };
    }

  }


  async findAll(empresaId: number): Promise<{ status: string; data?: Vendedor[]; message?: string }> {
    try {
      const vendedor = await this.vendedorRepo.find(
        {
          where: { id_empresa: empresaId },
          order: { nombre: 'ASC' },
        }
      );
      if (!vendedor || vendedor.length === 0) {
        return { status: 'error', message: 'No se encontraron vendedores' };
      }
      return { status: 'ok', data: vendedor };

    } catch (error) {
      throw new Error(`Error fetching vendedores: ${error.message}`);
    }

  }

  async findOne(id: number) {
    return this.vendedorRepo.findOne({ where: { id } });
  }

  async update(id: number, updateVendedorDto: UpdateVendedorDto) {

    return await this.vendedorRepo.update(id, updateVendedorDto)
      .then(() => ({ status: 'ok', message: 'Vendedor actualizado exitosamente' }))
      .catch(error => ({ status: 'error', message: `Error al actualizar el vendedor: ${error.message}` }));
  }

  async remove(id: number) {
    return await this.vendedorRepo.delete(id)
      .then(() => ({ status: 'ok', message: 'Vendedor eliminado exitosamente' }))
      .catch(error => ({ status: 'error', message: `Error al eliminar el vendedor: ${error.message}` }));
  }


}
