import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtPayload } from './jwt-payload.interface.js';
import { RegisterDto } from './dto/register/register.js';
import { LoginDto } from './dto/login/login.js';
import { ChangePasswordDto } from './dto/change-password/change-password.js';


export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  private signToken(user: Pick<User, 'id' | 'email' | 'role'>) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const password = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { ...dto, password },
        select: publicUserSelect
      });

      return { user, accessToken: await this.signToken(user) }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El email ya está en uso');
      }
      throw error;
    }
  };

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Credenciales incorrectas');
    const { password: _password, ...publicUser } = user;
    return { user, accessToken: await this.signToken(user) };
  };

  async changePassword(user: JwtPayload, dto: ChangePasswordDto) {
    const userExist = await this.prisma.user.findUnique({ where: { id: user.sub } })
    if (!userExist) throw new NotFoundException('Usuario no encontrado');
    const samePassword = await bcrypt.compare(dto.currentPassword, userExist.password);
    if (!samePassword) throw new UnauthorizedException('Credenciales inválidas')
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { password: hashedPassword },
    })
    return { message: 'Contraseña actualizada' }
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) throw new UnauthorizedException('Usuario no existe');
    return user;
  }
}
