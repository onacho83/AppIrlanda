import { PrismaClient } from '@prisma/client';
import { IAccountMovementRepository, CreateAccountMovementDTO } from '../../../domain/repositories/IAccountMovementRepository';
import { AccountMovement, AccountMovementType } from '../../../domain/entities/AccountMovement';

export class PrismaAccountMovementRepository implements IAccountMovementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAccountMovementDTO): Promise<AccountMovement> {
    const movement = await this.prisma.accountMovement.create({
      data: {
        client_id: data.clientId,
        order_id: data.orderId,
        payment_id: data.paymentId,
        type: data.type as any,
        amount: data.amount,
        balance_after: data.balanceAfter,
        description: data.description,
        registered_by: data.registeredBy,
      },
    });
    return this.toDomain(movement);
  }

  async findByClient(clientId: string): Promise<AccountMovement[]> {
    const movements = await this.prisma.accountMovement.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
    });
    return movements.map(this.toDomain);
  }

  async findLastByClient(clientId: string): Promise<AccountMovement | null> {
    const movement = await this.prisma.accountMovement.findFirst({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
    });
    if (!movement) return null;
    return this.toDomain(movement);
  }

  private toDomain(data: any): AccountMovement {
    return new AccountMovement(
      data.id,
      data.client_id,
      data.order_id,
      data.payment_id,
      data.type as AccountMovementType,
      Number(data.amount),
      Number(data.balance_after),
      data.description,
      data.registered_by,
      data.created_at
    );
  }
}
