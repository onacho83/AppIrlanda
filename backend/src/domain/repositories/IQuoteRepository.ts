import { Quote, QuoteItem, QuoteStatus } from '../entities/Quote';

export interface QuoteFilters {
  page?: number;
  limit?: number;
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateQuoteItemDTO {
  productId: string;
  description?: string | null;
  quantity: number;
  specifications?: Record<string, unknown> | null;
  unitPrice: number;
  subtotal: number;
}

export interface CreateQuoteDTO {
  quoteNumber: string;
  clientId: string;
  createdBy: string;
  validUntil?: Date | null;
  notes?: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  items: CreateQuoteItemDTO[];
}

export interface UpdateQuoteDTO {
  status?: QuoteStatus;
  convertedOrderId?: string | null;
}

export interface IQuoteRepository {
  findById(id: string): Promise<Quote | null>;
  findAll(filters?: QuoteFilters): Promise<{ data: Quote[]; total: number }>;
  findByClient(clientId: string): Promise<Quote[]>;
  create(data: CreateQuoteDTO): Promise<Quote>;
  update(id: string, data: UpdateQuoteDTO): Promise<Quote>;
  getNextQuoteNumber(): Promise<string>;
}
