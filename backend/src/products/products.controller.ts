import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // --- Products ---

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productsService.create({ ...createProductDto, tenantId: req.user.tenantId });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.productsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.productsService.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Req() req: any) {
    return this.productsService.update(id, req.user.tenantId, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.tenantId);
  }

  // --- Categories ---

  @Get('categories')
  async findAllCategories(@Req() req: any) {
    return this.productsService.findAllCategories(req.user.tenantId);
  }

  @Get('category-tree')
  async getCategoryTree(@Req() req: any) {
    return this.productsService.getCategoryTree(req.user.tenantId);
  }

  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    return this.productsService.createCategory({ ...createCategoryDto, tenantId: req.user.tenantId });
  }

  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string, @Req() req: any) {
    return this.productsService.removeCategory(id, req.user.tenantId);
  }
}
