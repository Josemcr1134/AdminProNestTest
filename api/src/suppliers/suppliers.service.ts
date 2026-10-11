import { ConflictException, Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto.js';
import { UpdateSupplierDto } from './dto/update-supplier.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QuerySupplierDto } from './dto/query-supplier.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) { }
  async create(createSupplierDto: CreateSupplierDto) {
    try {
      return await this.prisma.supplier.create({ data: createSupplierDto });
    } catch (error) {
      const hasEmailExist = await this.prisma.supplier.findUnique({ where: { email: createSupplierDto.email } });
      if (hasEmailExist) {
        throw new ConflictException('Supplier with this email already exists');
      }
      throw error;
    }
  };

  async findAll(query: QuerySupplierDto) {
    const { page, limit, search } = query;

    // Calculamos cuántos registros saltar para la paginación
    const skip = (page - 1) * limit;

    // Construimos las condiciones del WHERE dinámicamente
    const whereConditions: Prisma.SupplierWhereInput = {};


    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({
        where: whereConditions,
        skip: skip,
        take: limit,
        orderBy: { id: 'desc' }, // Opcional: Ordenar por los más recientes
      }),
      this.prisma.supplier.count({ where: whereConditions }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id }, include: { products: true } });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      return await this.prisma.supplier.update({ where: { id }, data: updateSupplierDto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.supplier.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }
      throw error;
    }
  }
}
