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

  async updatePayment(id: string, data: {
    amount?: number;
    method?: PaymentMethod;
    reference?: string | null;
    notes?: string | null;
  }) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('Pago no encontrado');

    const amountDiff = data.amount !== undefined ? data.amount - payment.amount : 0;

    const updatedPayment = await this.paymentRepository.update(id, data);

    if (amountDiff !== 0) {
      if (payment.orderId) {
        const order = await this.orderRepository.findById(payment.orderId);
        if (order) {
          await this.orderRepository.update(order.id, {
            paidAmount: order.paidAmount + amountDiff
          });
        }
      }

      const client = await this.clientRepository.findById(payment.clientId);
      if (client?.hasCurrentAccount) {
        const movements = await this.accountMovementRepository.findByClient(payment.clientId);
        const movement = movements.find(m => m.paymentId === payment.id);
        
        if (movement) {
          await this.accountMovementRepository.update(movement.id, {
            amount: data.amount,
            description: movement.description?.includes('(Editado)') ? movement.description : `${movement.description} (Editado)`
          });
          await this.accountMovementRepository.recalculateBalances(payment.clientId);
        }
      }
    }

    return updatedPayment;
  }
}
