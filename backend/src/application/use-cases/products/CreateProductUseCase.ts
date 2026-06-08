import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { CreateProductInput } from '../../dtos/products/ProductDTO';

/**
 * Caso de uso: Crear un nuevo producto en una categoría existente.
 */
export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const product = await this.productRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      description: input.description ?? null,
      pricingType: input.pricingType,
      basePrice: input.basePrice,
      pricingRules: input.pricingRules ?? null,
      active: input.active,
    });

    return product;
  }
}
