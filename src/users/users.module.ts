import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Rol } from './entities/role.entity';
import { LocationModel } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    User,
    Rol,
    LocationModel
  ])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
