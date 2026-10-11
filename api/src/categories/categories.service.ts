import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({ data: dto });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`La categoria ${dto.name} ya existe`);
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    if (!category) throw new NotFoundException(`Categoria  ${id} no existe`);
    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    if (!category) throw new NotFoundException(`Categoria  ${id} no existe`);

    const hasProducts = await this.prisma.product.count({
      where: { categoryId: id }
    });
    if (hasProducts) throw new NotFoundException(`Categoria  ${id} tiene ${hasProducts} productos asociados`);
    return this.prisma.category.delete({
      where: { id }
    });
  }
}
