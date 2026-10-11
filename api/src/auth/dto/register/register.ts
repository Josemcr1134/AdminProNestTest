import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, Length, Matches } from "class-validator";

export class RegisterDto {

  @ApiProperty({ example: 'Jose Manuel', })
  @IsString() @Length(2, 60)
  name: string;


  @ApiProperty({ example: 'jose@correo.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString() @Length(8, 64)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'La contraseña necesita al menos una mayúscula y un número' })
  password: string;
}
