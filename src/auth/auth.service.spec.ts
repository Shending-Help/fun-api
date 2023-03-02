import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return a user if the email and password are correct', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'password';
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user);
      jest.spyOn(user, 'comparePassword').mockResolvedValueOnce(true);

      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await authService.validateUser(loginUserDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(user.comparePassword).toHaveBeenCalledWith(loginUserDto.password);
      expect(result).toEqual(user);
    });

    it('should throw an UnauthorizedException if the email is incorrect', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(null);

      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      await expect(authService.validateUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.password = 'password';
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValueOnce(user);
      jest.spyOn(user, 'comparePassword').mockResolvedValueOnce(false);

      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      await expect(authService.validateUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(user.comparePassword).toHaveBeenCalledWith(loginUserDto.password);
    });
  });

  describe('login', () => {
    it('should return an access token if the email and password are correct', async () => {
      const user = new User();
      user.id = 1;
      user.email = 'test@example.com';
      user.password = 'password';
      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access_token');

      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result = await authService.login(loginUserDto);

      expect(authService.validateUser).toHaveBeenCalledWith(loginUserDto);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
      expect(result).toEqual({ access_token: 'access_token' });
    });

    it('should throw an UnauthorizedException if the email or password is incorrect', async () => {
      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValueOnce(new UnauthorizedException());

      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(loginUserDto);
    });
  });
});
