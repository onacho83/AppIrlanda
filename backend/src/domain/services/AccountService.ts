import { IAccountMovementRepository } from '../repositories/IAccountMovementRepository';
import { IPaymentRepository } from '../repositories/IPaymentRepository';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { IClientRepository } from '../repositories/IClientRepository';
import { PaymentMethod } from '../entities/Payment';
import { AccountMovementType } from '../entities/AccountMovement';
import { ValidationError, NotFoundError } from '../../shared/errors/AppError';

export class AccountService {
  constructor(
    private readonly accountMovementRepository: IAccountMovementRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async registerPayment(data: {
    clientId: string;
    amount: number;
    method: PaymentMethod;
    orderId?: string | null;
    registeredBy?: string | null;
    reference?: string | null;
    notes?: string | null;
  }) {
    const client = await this.clientRepository.findById(data.clientId);
    if (!client) throw new NotFoundError('Cliente no encontrado');

    if (data.orderId) {
      const order = await this.orderRepository.findById(data.orderId);
      if (!order) throw new NotFoundError('Pedido no encontrado');
      if (order.clientId !== data.clientId) {
        throw new ValidationError('El pedido no pertenece al cliente especificado');
      }
    }

    const payment = await this.paymentRepository.create({
      clientId: data.clientId,
      amount: data.amount,
      method: data.method,
      orderId: data.orderId,
      registeredBy: data.registeredBy,
      reference: data.reference,
      notes: data.notes
    });

    if (data.orderId) {
      const order = await this.orderRepository.findById(data.orderId);
      if (order) {
        await this.orderRepository.update(order.id, {
          paidAmount: order.paidAmount + data.amount
        });
      }
    }

    if (client.hasCurrentAccount) {
      const lastMovement = await this.accountMovementRepository.findLastByClient(data.clientId);
      const previousBalance = lastMovement ? lastMovement.balanceAfter : 0;
      const newBalance = previousBalance - data.amount;

      await this.accountMovementRepository.create({
        clientId: data.clientId,
        paymentId: payment.id,
        type: AccountMovementType.PAGO,
        amount: data.amount,
        balanceAfter: newBalance,
        description: `Pago registrado${data.orderId ? ` para pedido ${data.orderId}` : ''}`,
        registeredBy: data.registeredBy
      });
    }

    return payment;
  }
}
