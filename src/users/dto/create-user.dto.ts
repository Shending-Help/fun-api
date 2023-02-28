import { IsEmail, IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsDecimal()
  latitude: number;

  @IsNotEmpty()
  @IsDecimal()
  longitude: number;
}
