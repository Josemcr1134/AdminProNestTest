import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { Prisma } from '@prisma/client';
import { JwtPayload } from '../auth/jwt-payload.interface.js';
import { publicUserSelect } from '../auth/auth.service.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }


  async findAll(q: QueryUserDto) {
    const where: Prisma.UserWhereInput = {
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { email: { contains: q.search, mode: 'insensitive' } }
        ]
      })
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: publicUserSelect,
        orderBy: { id: 'asc' }


      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    };
  };

  async update(actionUser: JwtPayload, id: number, updateUserDto: UpdateUserRoleDto) {
    if (actionUser?.sub === id) throw new ForbiddenException('No puedes cambiar tu propio rol')

    const userExist = await this.prisma.user.findUnique({ where: { id: id } })
    if (!userExist) throw new NotFoundException('Usuario no encontrado');


    await this.prisma.user.update({
      where: { id: userExist.id },
      data: { role: updateUserDto.role },
    })
    return { message: 'Rol actualizado' }
  }

  async remove(actionUser: JwtPayload, id: number) {
    if (actionUser.sub === id) throw new ForbiddenException('No puedes eliminar tu propio usuario');
    const userExists = await this.prisma.user.findUnique({ where: { id: id } })
    if (!userExists) throw new NotFoundException('Usuario no encontrado')
    const hasOrders = await this.prisma.order.count({ where: { userId: id } })
    if (hasOrders) throw new ConflictException('Usuario tiene ordenes asociadas')
    await this.prisma.user.delete({ where: { id: id } })
    return { message: `Usuario ${id} eliminado correctamente` }
  }
}
