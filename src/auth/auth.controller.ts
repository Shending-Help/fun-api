import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import {
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint for user authentication.
   * Validates the user's credentials and generates an access token on success.
   *
   * @param loginUserDto DTO containing user's email and password
   * @returns Object containing the access token on successful authentication
   * @throws UnauthorizedException If the user's credentials are invalid
   */
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiOkResponse({
    description: 'Authentication successful',
    schema: {
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
