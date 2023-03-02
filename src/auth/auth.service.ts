import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user's login credentials and returns the user if successful.
   *
   * @param loginUserDto DTO containing user's email and password
   * @throws UnauthorizedException If the provided email or password is incorrect
   * @returns The user object if successful
   */
  async validateUser(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(
      loginUserDto.email.toLowerCase(),
    );

    if (!(await user?.comparePassword(loginUserDto.password))) {
      throw new UnauthorizedException();
    }

    return user;
  }

  /**
   * Logs a user in and returns a JWT access token.
   *
   * @param loginUserDto DTO containing user's email and password
   * @throws UnauthorizedException If the provided email or password is incorrect
   * @returns An object containing the JWT access token
   */
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto);

    return {
      access_token: this.jwtService.sign({ id: user.id }),
    };
  }
}
