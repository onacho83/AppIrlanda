import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductFiltersInput } from '../../dtos/products/ProductDTO';

/** Resultado paginado de la lista de productos */
export interface ListProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Caso de uso: Listar productos con paginación y filtro opcional por categoría.
 */
export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(filters: ProductFiltersInput): Promise<ListProductsResult> {
    const { data, total } = await this.productRepository.findAll({
      page: filters.page,
      limit: filters.limit,
      categoryId: filters.categoryId,
      active: filters.active,
    });

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }
}
