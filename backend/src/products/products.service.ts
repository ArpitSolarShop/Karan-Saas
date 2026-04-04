import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // --- Product Methods ---

  async findAll(tenantId?: string) {
    return this.prisma.product.findMany({
      where: tenantId ? { tenantId } : undefined,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // --- Category Methods ---

  async findAllCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenantId },
      include: {
        _count: { select: { products: true } },
        parent: true,
      },
    });
  }

  async getCategoryTree(tenantId: string) {
    const categories = await this.prisma.productCategory.findMany({
      where: { tenantId },
      include: {
        _count: { select: { products: true } },
      },
    });

    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter((c) => c.parentId === parentId)
        .map((c) => ({
          ...c,
          children: buildTree(c.id),
        }));
    };

    return buildTree(null);
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.prisma.productCategory.create({
      data: createCategoryDto,
    });
  }

  async removeCategory(id: string) {
    return this.prisma.productCategory.delete({
      where: { id },
    });
  }
}
