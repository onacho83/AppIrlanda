import { PrismaClient } from '@prisma/client';
import { IInvoiceRepository } from '../../../domain/repositories/IInvoiceRepository';
import { Invoice } from '../../../domain/entities/Invoice';

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToDomain(record: any): Invoice {
    return new Invoice(
      record.id,
      record.client_id,
      record.created_by,
      record.invoice_type,
      record.sale_point,
      record.invoice_number,
      record.cae,
      record.cae_expiration,
      Number(record.net_amount),
      Number(record.tax_amount),
      Number(record.total),
      record.qr_data,
      record.arca_request,
      record.arca_response,
      record.created_at
    );
  }

  async findById(id: string): Promise<Invoice | null> {
    const record = await this.prisma.invoice.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByOrder(orderId: string): Promise<Invoice | null> {
    // Order tiene invoice_id, podemos buscar la invoice relacionada a la orden
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { invoice: true }
    });
    if (!order?.invoice) return null;
    return this.mapToDomain(order.invoice);
  }

  async findAll(filters?: { clientId?: string; limit?: number; page?: number }): Promise<{ data: Invoice[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.clientId && { client_id: filters.clientId })
    };

    const [records, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: records.map(r => this.mapToDomain(r)),
      total,
    };
  }

  async create(invoice: Omit<Invoice, 'id' | 'createdAt'>, orderIds: string[]): Promise<Invoice> {
    const record = await this.prisma.invoice.create({
      data: {
        client_id: invoice.clientId,
        created_by: invoice.createdBy,
        invoice_type: invoice.invoiceType,
        sale_point: invoice.salePoint,
        invoice_number: invoice.invoiceNumber,
        cae: invoice.cae,
        cae_expiration: invoice.caeExpiration,
        net_amount: invoice.netAmount,
        tax_amount: invoice.taxAmount,
        total: invoice.total,
        qr_data: invoice.qrData,
        arca_request: invoice.arcaRequest,
        arca_response: invoice.arcaResponse,
        // Asociar las rdenes a esta factura
        orders: {
          connect: orderIds.map(id => ({ id }))
        }
      },
    });

    return this.mapToDomain(record);
  }
}
