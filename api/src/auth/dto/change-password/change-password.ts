import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class ChangePasswordDto {

  @ApiProperty({ example: 'Secreta123' })
  @IsString() @Length(8, 64)
  currentPassword: string;

  @ApiProperty({ example: 'Secreta123' })
  @IsString() @Length(8, 64)
  @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'La nueva contraseña necesita al menos una mayúscula y un número' })
  newPassword: string;
}
