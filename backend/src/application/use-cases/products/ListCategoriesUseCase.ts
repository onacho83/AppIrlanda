import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { ProductCategory } from '../../../domain/entities/Product';

/**
 * Caso de uso: Listar todas las categorías de productos activas.
 */
export class ListCategoriesUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductCategory[]> {
    return this.productRepository.listCategories();
  }
}
