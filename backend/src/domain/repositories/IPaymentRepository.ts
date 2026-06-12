import { Payment, PaymentMethod } from '../entities/Payment';

export interface CreatePaymentDTO {
  orderId?: string | null;
  clientId: string;
  registeredBy?: string | null;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
}

export interface IPaymentRepository {
  create(payment: CreatePaymentDTO): Promise<Payment>;
  update(id: string, data: Partial<CreatePaymentDTO>): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByOrder(orderId: string): Promise<Payment[]>;
  findByClient(clientId: string): Promise<Payment[]>;
  findAll(page?: number, limit?: number): Promise<{ data: Payment[], total: number }>;
}
