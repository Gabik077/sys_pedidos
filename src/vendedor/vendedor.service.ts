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

  findOne(id: number) {
    return `This action returns a #${id} vendedor`;
  }

  update(id: number, updateVendedorDto: UpdateVendedorDto) {
    return `This action updates a #${id} vendedor`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendedor`;
  }
}
