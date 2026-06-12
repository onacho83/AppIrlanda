import { AccountMovement, AccountMovementType } from '../entities/AccountMovement';

export interface CreateAccountMovementDTO {
  clientId: string;
  orderId?: string | null;
  paymentId?: string | null;
  type: AccountMovementType;
  amount: number;
  balanceAfter: number;
  description?: string | null;
  registeredBy?: string | null;
}

export interface IAccountMovementRepository {
  create(movement: CreateAccountMovementDTO): Promise<AccountMovement>;
  findByClient(clientId: string): Promise<AccountMovement[]>;
  findLastByClient(clientId: string): Promise<AccountMovement | null>;
  update(id: string, data: { amount?: number; description?: string }): Promise<AccountMovement>;
  recalculateBalances(clientId: string): Promise<void>;
}
