import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint to create a new user.
   *
   * @param createUserDto DTO containing user details
   * @throws InternalServerErrorException If an error occurs while creating the user
   * @returns Newly created user object
   */
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'user address is not within the US',
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { user };
  }

  /**
   * Endpoint to find a user by ID.
   * Only accessible to authenticated users.
   *
   * @param id ID of the user to find
   * @throws InternalServerErrorException If an error occurs while finding the user
   * @returns User object matching the provided ID
   */
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The user has been successfully retrieved.',
    type: User,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Find a user by ID' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(+id);
      return { user };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
