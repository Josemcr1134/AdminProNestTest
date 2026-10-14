import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: createProductDto });
    } catch (error) {
      // UnExisting Product Category
      const isCategoryExist = await this.prisma.category.findUnique({ where: { id: createProductDto.categoryId } });
      if (!isCategoryExist) {
        throw new BadRequestException('The specified category does not exist.');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A product with this SKU already exists.');
      }
      throw error;
    }
  };

  async findAll(q: QueryProductDto) {
    const where: Prisma.ProductWhereInput = {
      ...(q.categoryId && { categoryId: q.categoryId }),
      ...(q.active !== undefined && { active: q.active }),
      ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {
        price: { gte: q.minPrice, lte: q.maxPrice },
      }),
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { sku: { contains: q.search, mode: 'insensitive' } }
        ]
      })
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: q.sortBy ? { [q.sortBy]: q.sortOrder } : undefined,
        skip: (q.page - 1) * q.limit,
        take: q.limit,

      }),
      this.prisma.product.count({ where })
    ]);

    return {
      data,
      meta: { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) },
    };
  };

  async lowProductStock(threshold: number) {
    return this.prisma.product.findMany({
      where: { stock: { lt: threshold } },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
  }

  findOne(id: number) {
    try {
      return this.prisma.product.findUnique({ where: { id }, include: { category: true } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({ where: { id }, data: updateProductDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  remove(id: number) {
    try {
      return this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }
}
