import { IQuoteRepository } from '../../../domain/repositories/IQuoteRepository';
import { Quote } from '../../../domain/entities/Quote';
import { QuoteFiltersInput } from '../../dtos/quotes/QuoteDTO';

export class ListQuotesUseCase {
  constructor(private readonly quoteRepository: IQuoteRepository) {}

  async execute(filters: QuoteFiltersInput): Promise<{ data: Quote[]; total: number }> {
    return this.quoteRepository.findAll(filters);
  }
}
