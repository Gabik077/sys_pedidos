import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // Obtener todos los usuarios de la tabla "usuarios"
  async findAll(): Promise<User[]> {

    let users = await this.usersRepository.find({
      relations: ['rol'],
      select: {
        id: true,
        nombre: true,
        email: true,
        fecha_registro: true,
        rol: { id: true, descripcion: true }, // Incluir solo lo necesario del rol
      },
    });

    console.log(users);
    return users;
  }


  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
