import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsDecimal } from 'class-validator/types/decorator/decorators';

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
