import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { UpdateProductInput } from '../../dtos/products/ProductDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

/**
 * Caso de uso: Actualizar un producto existente.
 * Valida que el producto exista antes de actualizar.
 */
export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    // Verificar que el producto existe
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado`);
    }

    const updated = await this.productRepository.update(id, {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      pricingType: input.pricingType,
      basePrice: input.basePrice,
      pricingRules: input.pricingRules,
      active: input.active,
    });

    return updated;
  }
}
