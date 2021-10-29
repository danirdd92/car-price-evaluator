import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((u) => u.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: ({ email, password }: CreateUserDto) => {
        const user = { id: Math.floor(Math.random() * 100000), email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'test-pwd');
    expect(user.password !== 'test-pwd');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error with email that is already in use', async () => {
    await service.signup('test@test.com', 'pass');
    const promise = service.signup('test@test.com', 'pass');
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws err if signin is called with an unused password or email', async () => {
    const promise = service.signin('test@test.com', 'test');
    await expect(promise).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws err if wrong password is provided', async () => {
    await service.signup('test@test.com', 'a');
    const promise = service.signin('test@test.com', 'b');
    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@test.com', 'test-pwd');
    const user = await service.signin('test@test.com', 'test-pwd');
    expect(user).toBeDefined();
  });
});
