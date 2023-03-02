import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockRepository = {
      // Implement necessary methods
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John',
        email: 'john@example.com',
        password: 'password',
        latitude: 37.7749,
        longitude: -122.4194,
      };
      const createdUser = new User();
      createdUser.name = createUserDto.name;
      createdUser.email = createUserDto.email;
      createdUser.city = 'San Francisco';
      createdUser.state = 'California';
      createdUser.id = 1;
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);
      expect(result).toEqual({ user: createdUser });
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const id = '1';
      const foundUser = new User();
      foundUser.id = 1;
      foundUser.name = 'John Doe';
      foundUser.email = 'johne@example.com';
      foundUser.city = 'San Francisco';
      foundUser.state = 'California';
      jest.spyOn(usersService, 'findOne').mockResolvedValue(foundUser);

      const result = await controller.findOne(id);
      expect(result).toEqual({ user: foundUser });
    });

    it('should throw an InternalServerErrorException if usersService.findOne throws an error', async () => {
      const id = '1';
      jest
        .spyOn(usersService, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
