import { PrismaClient, Prisma } from '@prisma/client';
import { IQuoteRepository, QuoteFilters, CreateQuoteDTO, UpdateQuoteDTO } from '../../../domain/repositories/IQuoteRepository';
import { Quote, QuoteItem, QuoteStatus } from '../../../domain/entities/Quote';

export class PrismaQuoteRepository implements IQuoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Quote | null> {
    const data = await this.prisma.quote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findAll(filters?: QuoteFilters): Promise<{ data: Quote[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {};
    if (filters?.status) {
      where.status = filters.status as any;
    }
    if (filters?.clientId) {
      where.client_id = filters.clientId;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) where.created_at.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.created_at.lte = new Date(filters.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { items: true },
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      data: data.map((d) => this.toDomain(d)),
      total,
    };
  }

  async findByClient(clientId: string): Promise<Quote[]> {
    const data = await this.prisma.quote.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
      include: { items: true },
    });
    return data.map((d) => this.toDomain(d));
  }

  async create(data: CreateQuoteDTO): Promise<Quote> {
    const created = await this.prisma.quote.create({
      data: {
        quote_number: data.quoteNumber,
        client_id: data.clientId,
        created_by: data.createdBy,
        valid_until: data.validUntil,
        notes: data.notes,
        subtotal: data.subtotal,
        tax_amount: data.taxAmount,
        total: data.total,
        items: {
          create: data.items.map(item => ({
            product_id: item.productId,
            description: item.description,
            quantity: item.quantity,
            specifications: item.specifications ? (item.specifications as any) : Prisma.JsonNull,
            unit_price: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: true },
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateQuoteDTO): Promise<Quote> {
    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        status: data.status as any,
        converted_order_id: data.convertedOrderId,
      },
      include: { items: true },
    });
    return this.toDomain(updated);
  }

  async getNextQuoteNumber(): Promise<string> {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const prefix = `PRES-${yy}${mm}${dd}-`;

    const lastQuote = await this.prisma.quote.findFirst({
      where: { quote_number: { startsWith: prefix } },
      orderBy: { quote_number: 'desc' },
    });

    let nextNumber = 1;
    if (lastQuote) {
      const lastSequence = parseInt(lastQuote.quote_number.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextNumber = lastSequence + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  private toDomain(data: Prisma.QuoteGetPayload<{ include: { items: true } }>): Quote {
    const items = data.items ? data.items.map((item) => new QuoteItem(
      item.id,
      item.quote_id,
      item.product_id,
      item.description,
      item.quantity,
      item.specifications as Record<string, unknown> | null,
      Number(item.unit_price),
      Number(item.subtotal)
    )) : [];

    return new Quote(
      data.id,
      data.quote_number,
      data.client_id,
      data.created_by,
      data.status as QuoteStatus,
      data.valid_until,
      data.notes,
      Number(data.subtotal),
      Number(data.tax_amount),
      Number(data.total),
      data.converted_order_id,
      data.created_at,
      items
    );
  }
}
