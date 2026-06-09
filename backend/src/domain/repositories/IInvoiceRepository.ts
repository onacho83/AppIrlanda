import { Invoice } from '../entities/Invoice';

export interface IInvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByOrder(orderId: string): Promise<Invoice | null>;
  findAll(filters?: { clientId?: string, limit?: number, page?: number }): Promise<{ data: Invoice[], total: number }>;
  create(invoice: Omit<Invoice, 'id' | 'createdAt'>, orderIds: string[]): Promise<Invoice>;
}
