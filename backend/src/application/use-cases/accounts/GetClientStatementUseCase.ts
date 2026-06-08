import { IAccountMovementRepository } from '../../../domain/repositories/IAccountMovementRepository';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetClientStatementUseCase {
  constructor(
    private readonly accountMovementRepository: IAccountMovementRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  async execute(clientId: string) {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente no encontrado');
    }

    if (!client.hasCurrentAccount) {
      throw new Error('El cliente no tiene cuenta corriente habilitada');
    }

    const movements = await this.accountMovementRepository.findByClient(clientId);
    const lastMovement = await this.accountMovementRepository.findLastByClient(clientId);
    const balance = lastMovement ? lastMovement.balanceAfter : 0;

    return {
      client: {
        id: client.id,
        name: client.name,
      },
      balance,
      movements
    };
  }
}
