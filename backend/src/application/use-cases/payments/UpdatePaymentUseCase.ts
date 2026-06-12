import { AccountService } from '../../../domain/services/AccountService';
import { UpdatePaymentInput } from '../../dtos/payments/PaymentDTO';

export class UpdatePaymentUseCase {
  constructor(private readonly accountService: AccountService) {}

  async execute(id: string, input: UpdatePaymentInput) {
    return this.accountService.updatePayment(id, {
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      notes: input.notes,
    });
  }
}
