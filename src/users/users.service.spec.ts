import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import fetch from 'node-fetch';

jest.mock('node-fetch');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    it('should create a new user and return it', async () => {
      const mockAddress = { city: 'San Francisco', state: 'CA', country: 'United States' };
      const mockUser = new User();
      mockUser.name = mockCreateUserDto.name;
      mockUser.email = mockCreateUserDto.email;
      mockUser.password = mockCreateUserDto.password;
      mockUser.city = mockAddress.city;
      mockUser.state = mockAddress.state;

      jest.spyOn(service, 'generateAddress').mockResolvedValue(mockAddress);
      jest.spyOn(mockUser, 'save').mockResolvedValue(undefined);

      const result = await service.create(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(service.generateAddress).toHaveBeenCalledWith(mockCreateUserDto);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw a BadRequestException when user address is not within the US', async () => {
      const mockAddress = { city: 'Vancouver', state: 'BC', country: 'Canada' };

      jest.spyOn(service, 'generateAddress').mockResolvedValue(mockAddress);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(BadRequestException);
      expect(service.generateAddress).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should throw an HttpException when an error occurs', async () => {
      const mockError = new Error('Error');
      jest.spyOn(service, 'generateAddress').mockRejectedValue(mockError);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(HttpException);
      expect(service.generateAddress).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('generateAddress', () => {
    const mockCreateUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    const mockAddressResponse = {
      results: [
        {
          address_components: [
            { long_name: 'San Francisco', types: ['locality', 'political'] },
            { long_name: 'San Francisco County', types: ['administrative_area_level_2', 'political'] },
            { long_name: 'California', types: ['administrative_area_level_1', 'political'] },
            { long_name: 'United States', types: ['country', 'political'] },
          ],
          formatted_address: 'San Francisco, CA, USA',
        },
      ],
      status: 'OK',
    };

    it('should generate an address and return it')

