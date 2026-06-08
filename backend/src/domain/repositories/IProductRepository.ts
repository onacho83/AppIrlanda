import { Product, ProductCategory } from '../entities/Product';

/** Filtros para listar productos con paginación */
export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  active?: boolean;
}

/** Datos necesarios para crear un nuevo producto */
export interface CreateProductDTO {
  categoryId: string;
  name: string;
  description?: string | null;
  pricingType?: string;
  basePrice: number;
  pricingRules?: Record<string, unknown> | null;
  active?: boolean;
}

/** Datos opcionales para actualizar un producto existente */
export interface UpdateProductDTO {
  categoryId?: string;
  name?: string;
  description?: string | null;
  pricingType?: string;
  basePrice?: number;
  pricingRules?: Record<string, unknown> | null;
  active?: boolean;
}

/** Datos necesarios para crear una nueva categoría */
export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

/** Datos opcionales para actualizar una categoría existente */
export interface UpdateCategoryDTO {
  name?: string;
  description?: string | null;
  sortOrder?: number;
  active?: boolean;
}

/**
 * Contrato del repositorio de productos.
 * Define las operaciones de persistencia para Product y ProductCategory.
 */
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filters?: ProductFilters): Promise<{ data: Product[]; total: number }>;
  findByCategory(categoryId: string): Promise<Product[]>;
  create(product: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  listCategories(): Promise<ProductCategory[]>;
  createCategory(data: CreateCategoryDTO): Promise<ProductCategory>;
  updateCategory(id: string, data: UpdateCategoryDTO): Promise<ProductCategory>;
}
