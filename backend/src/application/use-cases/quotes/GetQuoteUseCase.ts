import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Quote } from '../../../domain/entities/Quote';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetQuoteUseCase {
  constructor(
    private readonly quoteRepository: IQuoteRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(id: string): Promise<any> {
    const quote = await this.quoteRepository.findById(id);
    if (!quote) {
      throw new NotFoundError(`Presupuesto con ID ${id} no encontrado`);
    }

    const client = await this.clientRepository.findById(quote.clientId);

    return {
      ...quote,
      client: client ? {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email
      } : undefined
    };
  }
}
