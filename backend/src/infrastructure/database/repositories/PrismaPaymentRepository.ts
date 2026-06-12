import { PrismaClient } from '@prisma/client';
import { IPaymentRepository, CreatePaymentDTO } from '../../../domain/repositories/IPaymentRepository';
import { Payment, PaymentMethod } from '../../../domain/entities/Payment';

export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreatePaymentDTO): Promise<Payment> {
    const payment = await this.prisma.payment.create({
      data: {
        order_id: data.orderId,
        client_id: data.clientId,
        registered_by: data.registeredBy,
        amount: data.amount,
        method: data.method as any,
        reference: data.reference,
        notes: data.notes,
      },
    });
    return this.toDomain(payment);
  }

  async update(id: string, data: Partial<CreatePaymentDTO>): Promise<Payment> {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        amount: data.amount,
        method: data.method as any,
        reference: data.reference,
        notes: data.notes,
      },
    });
    return this.toDomain(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) return null;
    return this.toDomain(payment);
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
    });
    return payments.map(this.toDomain);
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
    });
    return payments.map(this.toDomain);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Payment[], total: number }> {
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments.map(this.toDomain),
      total,
    };
  }

  private toDomain(data: any): Payment {
    return new Payment(
      data.id,
      data.order_id,
      data.client_id,
      data.registered_by,
      Number(data.amount),
      data.method as PaymentMethod,
      data.reference,
      data.notes,
      data.created_at
    );
  }
}
