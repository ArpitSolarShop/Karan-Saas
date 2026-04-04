import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { ColumnType } from '@prisma/client';

@Injectable()
export class CustomFieldsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, entityType?: string) {
    const where: any = { tenantId };
    if (entityType) {
      where.entityType = entityType;
    }
    return this.prisma.customFieldDefinition.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const field = await this.prisma.customFieldDefinition.findUnique({
      where: { id },
    });
    if (!field) throw new NotFoundException('Custom field definition not found');
    return field;
  }

  async create(dto: CreateCustomFieldDto) {
    return this.prisma.customFieldDefinition.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateCustomFieldDto) {
    return this.prisma.customFieldDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.customFieldDefinition.delete({
      where: { id },
    });
  }

  /**
   * Validates values against definitions and returns a sanitized object
   */
  async validateAndSanitize(tenantId: string, entityType: string, values: Record<string, any>) {
    if (!values) return {};
    
    const definitions = await this.findAll(tenantId, entityType);
    const sanitized: Record<string, any> = {};

    for (const def of definitions) {
      const value = values[def.name];

      // Check required
      if (def.isRequired && (value === undefined || value === null || value === '')) {
        throw new BadRequestException(`Field "${def.label}" is required`);
      }

      if (value !== undefined && value !== null && value !== '') {
        // Type validation
        this.validateType(def, value);
        sanitized[def.name] = value;
      } else if (def.defaultValue !== null) {
        sanitized[def.name] = this.castValue(def.type, def.defaultValue);
      }
    }

    return sanitized;
  }

  private validateType(def: any, value: any) {
    const { type, label, options } = def;
    
    switch (type) {
      case ColumnType.NUMBER:
      case ColumnType.CURRENCY:
      case ColumnType.PERCENT:
        if (isNaN(Number(value))) throw new BadRequestException(`${label} must be a number`);
        break;
      case ColumnType.BOOLEAN:
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          throw new BadRequestException(`${label} must be a boolean`);
        }
        break;
      case ColumnType.SELECT:
        if (options && Array.isArray(options) && !options.includes(value)) {
          throw new BadRequestException(`${label} must be one of: ${options.join(', ')}`);
        }
        break;
      case ColumnType.MULTISELECT:
        if (!Array.isArray(value)) throw new BadRequestException(`${label} must be an array`);
        if (options && Array.isArray(options)) {
          for (const val of value) {
            if (!options.includes(val)) {
              throw new BadRequestException(`${val} is not a valid option for ${label}`);
            }
          }
        }
        break;
    }
  }

  private castValue(type: ColumnType, value: string): any {
    switch (type) {
      case ColumnType.NUMBER:
      case ColumnType.CURRENCY:
      case ColumnType.PERCENT:
        return Number(value);
      case ColumnType.BOOLEAN:
        return value === 'true';
      case ColumnType.JSON:
      case ColumnType.MULTISELECT:
        try { return JSON.parse(value); } catch { return value; }
      default:
        return value;
    }
  }
}
