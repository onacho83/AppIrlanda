import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Quote } from '../../../domain/entities/Quote';
import { CreateQuoteInput } from '../../dtos/quotes/QuoteDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

export class CreateQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly clientRepository: IClientRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(input: CreateQuoteInput, createdBy: string): Promise<Quote> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw new NotFoundError(`Cliente con ID ${input.clientId} no encontrado`);
    }

    let totalSubtotal = 0;
    const items = [];

    for (const itemInput of input.items) {
      const product = await this.productRepository.findById(itemInput.productId);
      if (!product) {
        throw new NotFoundError(`Producto con ID ${itemInput.productId} no encontrado`);
      }

      const subtotal = itemInput.unitPrice * itemInput.quantity;
      totalSubtotal += subtotal;

      items.push({
        productId: itemInput.productId,
        description: itemInput.description,
        quantity: itemInput.quantity,
        specifications: itemInput.specifications,
        unitPrice: itemInput.unitPrice,
        subtotal: subtotal,
      });
    }

    const taxAmount = totalSubtotal * 0.21;
    const total = totalSubtotal + taxAmount;

    const quoteNumber = await this.quoteRepository.getNextQuoteNumber();

    let validUntil: Date | null = null;
    if (input.validUntil) {
      validUntil = new Date(input.validUntil);
    }

    const quote = await this.quoteRepository.create({
      quoteNumber,
      clientId: input.clientId,
      createdBy,
      validUntil,
      notes: input.notes ?? null,
      subtotal: totalSubtotal,
      taxAmount,
      total,
      items,
    });

    return quote;
  }
}
