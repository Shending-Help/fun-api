import { IsEmail, IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @TurnIntoLowerCase()
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
function TurnIntoLowerCase() {
  throw new Error('Function not implemented.');
}
