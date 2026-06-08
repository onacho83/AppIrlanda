import { AccountService } from '../../../domain/services/AccountService';
import { PaymentMethod } from '../../../domain/entities/Payment';

export interface RegisterPaymentInput {
  clientId: string;
  amount: number;
  method: string;
  orderId?: string | null;
  reference?: string | null;
  notes?: string | null;
}

export class RegisterPaymentUseCase {
  constructor(private readonly accountService: AccountService) {}

  async execute(input: RegisterPaymentInput, registeredBy: string) {
    return this.accountService.registerPayment({
      clientId: input.clientId,
      amount: input.amount,
      method: input.method as PaymentMethod,
      orderId: input.orderId,
      registeredBy,
      reference: input.reference,
      notes: input.notes
    });
  }
}
