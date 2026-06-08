import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { ProductCategory } from '../../../domain/entities/Product';
import { CreateCategoryInput } from '../../dtos/products/ProductDTO';

/**
 * Caso de uso: Crear una nueva categoría de producto.
 */
export class CreateCategoryUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateCategoryInput): Promise<ProductCategory> {
    return this.productRepository.createCategory({
      name: input.name,
      description: input.description ?? null,
      sortOrder: input.sortOrder,
      active: input.active,
    });
  }
}
