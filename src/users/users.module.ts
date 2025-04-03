import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Rol } from './entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Rol])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
