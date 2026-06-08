import { PrismaClient, Prisma } from '@prisma/client';
import { IProductRepository, ProductFilters, CreateProductDTO, UpdateProductDTO, CreateCategoryDTO, UpdateCategoryDTO } from '../../../domain/repositories/IProductRepository';
import { Product, ProductCategory } from '../../../domain/entities/Product';

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!data) return null;
    return this.toProductDomain(data);
  }

  async findAll(filters?: ProductFilters): Promise<{ data: Product[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (filters?.categoryId) {
      where.category_id = filters.categoryId;
    }
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((d) => this.toProductDomain(d)),
      total,
    };
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const data = await this.prisma.product.findMany({
      where: { category_id: categoryId, active: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    return data.map((d) => this.toProductDomain(d));
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        category_id: data.categoryId,
        name: data.name,
        description: data.description,
        pricing_type: data.pricingType as any || 'FIJO',
        base_price: data.basePrice,
        pricing_rules: data.pricingRules ? (data.pricingRules as any) : Prisma.JsonNull,
        active: data.active ?? true,
      },
      include: { category: true },
    });
    return this.toProductDomain(created);
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        category_id: data.categoryId,
        name: data.name,
        description: data.description,
        pricing_type: data.pricingType as any,
        base_price: data.basePrice,
        pricing_rules: data.pricingRules === null ? Prisma.JsonNull : (data.pricingRules as any),
        active: data.active,
      },
      include: { category: true },
    });
    return this.toProductDomain(updated);
  }

  async listCategories(): Promise<ProductCategory[]> {
    const data = await this.prisma.productCategory.findMany({
      orderBy: { sort_order: 'asc' },
    });
    return data.map((d) => this.toCategoryDomain(d));
  }

  async createCategory(data: CreateCategoryDTO): Promise<ProductCategory> {
    const created = await this.prisma.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
        sort_order: data.sortOrder || 0,
        active: data.active ?? true,
      },
    });
    return this.toCategoryDomain(created);
  }

  async updateCategory(id: string, data: UpdateCategoryDTO): Promise<ProductCategory> {
    const updated = await this.prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        sort_order: data.sortOrder,
        active: data.active,
      },
    });
    return this.toCategoryDomain(updated);
  }

  private toProductDomain(data: any): Product {
    return new Product(
      data.id,
      data.category_id,
      data.name,
      data.description,
      data.pricing_type,
      Number(data.base_price),
      data.pricing_rules,
      data.active,
      data.created_at,
      data.category ? this.toCategoryDomain(data.category) : undefined
    );
  }

  private toCategoryDomain(data: any): ProductCategory {
    return new ProductCategory(
      data.id,
      data.name,
      data.description,
      data.sort_order,
      data.active
    );
  }
}
