import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { AccountService } from './AccountService';
import { IAccountMovementRepository } from '../repositories/IAccountMovementRepository';
import { IPaymentRepository } from '../repositories/IPaymentRepository';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { IClientRepository } from '../repositories/IClientRepository';
import { PaymentMethod } from '../entities/Payment';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';

describe('AccountService', () => {
  let accountService: AccountService;
  let mockAccountMovementRepo: Mocked<IAccountMovementRepository>;
  let mockPaymentRepo: Mocked<IPaymentRepository>;
  let mockOrderRepo: Mocked<IOrderRepository>;
  let mockClientRepo: Mocked<IClientRepository>;

  beforeEach(() => {
    mockAccountMovementRepo = {
      create: vi.fn(),
      findLastByClient: vi.fn(),
      findByClient: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    mockPaymentRepo = {
      create: vi.fn(),
      findByClient: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as any;

    mockOrderRepo = {
      findById: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn()
    } as any;

    mockClientRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn()
    } as any;

    accountService = new AccountService(
      mockAccountMovementRepo,
      mockPaymentRepo,
      mockOrderRepo,
      mockClientRepo
    );
  });

  it('should throw NotFoundError if client does not exist', async () => {
    mockClientRepo.findById.mockResolvedValue(null);

    await expect(
      accountService.registerPayment({
        clientId: 'client-1',
        amount: 100,
        method: PaymentMethod.EFECTIVO
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError if order does not belong to client', async () => {
    mockClientRepo.findById.mockResolvedValue({ id: 'client-1' } as any);
    mockOrderRepo.findById.mockResolvedValue({ id: 'order-1', clientId: 'client-2' } as any);

    await expect(
      accountService.registerPayment({
        clientId: 'client-1',
        orderId: 'order-1',
        amount: 100,
        method: PaymentMethod.EFECTIVO
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should register payment and update order paidAmount', async () => {
    mockClientRepo.findById.mockResolvedValue({ id: 'client-1', hasCurrentAccount: false } as any);
    mockOrderRepo.findById.mockResolvedValue({ id: 'order-1', clientId: 'client-1', paidAmount: 50 } as any);
    mockPaymentRepo.create.mockResolvedValue({ id: 'payment-1' } as any);

    await accountService.registerPayment({
      clientId: 'client-1',
      orderId: 'order-1',
      amount: 100,
      method: PaymentMethod.TRANSFERENCIA
    });

    expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'client-1',
      amount: 100,
      method: PaymentMethod.TRANSFERENCIA
    }));

    // The paidAmount should be previous (50) + new (100) = 150
    expect(mockOrderRepo.update).toHaveBeenCalledWith('order-1', expect.objectContaining({
      paidAmount: 150
    }));

    // Should not create account movement because hasCurrentAccount is false
    expect(mockAccountMovementRepo.create).not.toHaveBeenCalled();
  });

  it('should create an account movement if client has current account', async () => {
    mockClientRepo.findById.mockResolvedValue({ id: 'client-1', hasCurrentAccount: true } as any);
    mockPaymentRepo.create.mockResolvedValue({ id: 'payment-1' } as any);
    mockAccountMovementRepo.findLastByClient.mockResolvedValue({ balanceAfter: 500 } as any);

    await accountService.registerPayment({
      clientId: 'client-1',
      amount: 200,
      method: PaymentMethod.EFECTIVO
    });

    // Previous balance 500, payment is 200, new balance should be 300
    expect(mockAccountMovementRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      clientId: 'client-1',
      paymentId: 'payment-1',
      amount: 200,
      balanceAfter: 300,
      type: 'PAGO'
    }));
  });
});
