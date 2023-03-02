import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
    city: 'San Francisco',
    state: 'California',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn().mockResolvedValue(mockUser),
            findOneBy: jest.fn(),
          },
          useFactory: () => ({
            metadata: {
              columns: [],
              relations: [],
            },
          }),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    it('should create a new user and return the user object without the password field', async () => {
      jest.spyOn(service, 'generateAddress').mockResolvedValue({
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
      });

      const createdUser = new User();
      createdUser.name = createUserDto.name;
      createdUser.email = createUserDto.email;
      createdUser.city = 'San Francisco';
      createdUser.state = 'California';
      jest.spyOn(userRepository, 'save').mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual({
        name: 'John Doe',
        email: 'johndoe@example.com',
        city: 'San Francisco',
        state: 'California',
      });
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    });
    it('should throw BadRequestException if the user address is not within the United States', async () => {
      jest.spyOn(service, 'generateAddress').mockResolvedValue({
        city: 'Toronto',
        state: 'Ontario',
        country: 'Canada',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw HttpException with status and error message if there is an error during the create function', async () => {
      jest
        .spyOn(service, 'generateAddress')
        .mockRejectedValue(new Error('Failed to generate address'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        HttpException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
  describe('generateAddress', () => {
    it('should return an address object with city, state, and country properties', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Act
      const result = await service.generateAddress(createUserDto);

      // Assert
      expect(result).toHaveProperty('city');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('country');
    });
  });
});
