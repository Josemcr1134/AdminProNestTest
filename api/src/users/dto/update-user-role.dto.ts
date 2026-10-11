import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {

  @ApiProperty({ example: 'ADMIN', })
  @IsString()
  @IsEnum(Role)
  role: Role;
}
