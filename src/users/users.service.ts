import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Rol } from './entities/role.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectDataSource()
    readonly dataSource: DataSource,
    @InjectRepository(Rol)
    private rolesRepository: Repository<Rol>
  ) { }

  async create(createUserDto: CreateUserDto) {

    try {
      const existingUser = await this.usersRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ],
      });


      if (existingUser) {
        return { status: "error", message: "El usuario ya existe" };
      }

      const newUser = await this.usersRepository.create(createUserDto);
      await this.usersRepository.save(newUser)
    }
    catch (error) {
      console.error("Error al crear el usuario:", error);
      return { status: "error", message: "Error al verificar el usuario" };
    }


    return { status: "ok", message: "Usuario creado exitosamente" };
  }

  // Obtener todos los usuarios de la tabla "usuarios"
  async findAll(): Promise<User[]> {

    const users = await this.usersRepository.find({
      relations: ['rol'],
      select: {
        id: true,
        nombre: true,
        email: true,
        fecha_registro: true,
        rol: { descripcion: true },
      },
    });

    return users;
  }

  async getRoles(): Promise<Rol[]> {
    return this.rolesRepository.find();
  }


  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({
      where: { id }
    });
  }
  // Actualizar un usuario
  async update(id: number, updateUserDto: UpdateUserDto) {

    try {
      const existingUser = await this.usersRepository.findOne({
        where: [{ id }], // Verifica si el usuario existe
      });
      if (!existingUser) {
        return { status: "error", message: "El usuario no existe" };
      }

      await this.usersRepository.update(id, updateUserDto);

    } catch (error) {
      console.error("Error al verificar el usuario:", error);
      return { status: "error", message: "Error al verificar el usuario" };
    }



    return { status: "ok", message: "Usuario actualizado exitosamente" };
  }

  async remove(id: number) {
    console.log("ID a borrar:", id);
    const user = await this.usersRepository.delete(id);


    if (user.affected === 0) {
      return { status: "error", message: "no se pudo borrar el usuario" };
    }

    return { status: "ok", message: "borrado exitoso" };
  }
}
