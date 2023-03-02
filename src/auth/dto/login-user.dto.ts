import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ type: String, description: 'Email of the user' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Password of the user' })
  password: string;
}
