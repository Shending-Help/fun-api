import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Name of the user' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Email of the user' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Password of the user' })
  password: string;

  @IsNotEmpty()
  @IsDecimal()
  @ApiProperty({ type: Number, description: 'Latitude of the user' })
  latitude: number;

  @IsNotEmpty()
  @IsDecimal()
  @ApiProperty({ type: Number, description: 'Longitude of the user' })
  longitude: number;
}
