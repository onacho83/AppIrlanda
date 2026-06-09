import { PrismaClient, Prisma } from '@prisma/client';
import { IOrderRepository, OrderFilters, CreateOrderDTO, UpdateOrderDTO, StatusHistoryDTO } from '../../../domain/repositories/IOrderRepository';
import { Order, OrderStatus } from '../../../domain/entities/Order';

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findAll(filters?: OrderFilters): Promise<{ data: Order[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
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
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((d) => this.toDomain(d)),
      total,
    };
  }

  async findByClient(clientId: string): Promise<Order[]> {
    const data = await this.prisma.order.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
    });
    return data.map((d) => this.toDomain(d));
  }

  async create(orderData: CreateOrderDTO): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        order_number: orderData.orderNumber,
        client_id: orderData.clientId,
        created_by: orderData.createdBy,
        product_id: orderData.productId,
        product_description: orderData.productDescription,
        quantity: orderData.quantity,
        specifications: orderData.specifications ? (orderData.specifications as any) : Prisma.JsonNull,
        unit_price: orderData.unitPrice,
        delivery_date: orderData.deliveryDate,
        notes: orderData.notes,
        design_file_reference: orderData.designFileReference,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount,
        total: orderData.total,
        charged_to_account: orderData.chargedToAccount || false,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateOrderDTO): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        product_description: data.productDescription,
        quantity: data.quantity,
        specifications: data.specifications === null ? Prisma.JsonNull : (data.specifications as any),
        unit_price: data.unitPrice,
        delivery_date: data.deliveryDate,
        notes: data.notes,
        design_file_reference: data.designFileReference,
        subtotal: data.subtotal,
        tax_amount: data.taxAmount,
        total: data.total,
        paid_amount: data.paidAmount,
      },
    });
    return this.toDomain(updated);
  }

  async updateStatus(id: string, status: string, changedBy: string, notes?: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const orderUpdated = await tx.order.update({
        where: { id },
        data: { status: status as any },
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: id,
          changed_by: changedBy,
          from_status: order.status,
          to_status: status as any,
          notes: notes,
        },
      });

      return orderUpdated;
    });

    return this.toDomain(updated);
  }

  async getNextOrderNumber(): Promise<string> {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const prefix = `IMP-${yy}${mm}${dd}-`;

    const lastOrder = await this.prisma.order.findFirst({
      where: { order_number: { startsWith: prefix } },
      orderBy: { order_number: 'desc' },
    });

    let nextNumber = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.order_number.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextNumber = lastSequence + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  async addStatusHistory(data: StatusHistoryDTO): Promise<void> {
    await this.prisma.orderStatusHistory.create({
      data: {
        order_id: data.orderId,
        changed_by: data.changedBy,
        from_status: data.fromStatus as any,
        to_status: data.toStatus as any,
        notes: data.notes,
      },
    });
  }

  private toDomain(data: any): Order {
    return new Order(
      data.id,
      data.order_number,
      data.client_id,
      data.created_by,
      data.product_id,
      data.product_description,
      data.quantity,
      data.specifications,
      Number(data.unit_price),
      data.status as OrderStatus,
      data.delivery_date,
      data.notes,
      data.design_file_reference,
      Number(data.subtotal),
      Number(data.tax_amount),
      Number(data.total),
      Number(data.paid_amount),
      data.charged_to_account,
      data.created_at,
      data.updated_at,
      data.invoice_id
    );
  }
}
