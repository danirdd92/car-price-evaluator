import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(newUser: CreateUserDto): Promise<User> {
    const user = this.repo.create(newUser);
    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) return null;
    return this.repo.findOne(id);
  }

  find(email: string) {
    return this.repo.find({ email });
  }

  async update(id: number, patch: Partial<User>) {
    const user = await this.repo.findOne(id);
    if (!user) throw new NotFoundException(`user with id ${id} not found`);

    Object.assign(user, patch);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.repo.findOne(id);
    if (!user) throw new NotFoundException(`user with id ${id} not found`);
    return this.repo.remove(user);
  }
}
