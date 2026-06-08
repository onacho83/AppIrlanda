import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { UpdateClientInput } from '../../dtos/clients/ClientDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

/**
 * Caso de uso: Actualizar datos de un cliente existente.
 * Valida que el cliente exista antes de actualizar.
 */
export class UpdateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string, input: UpdateClientInput): Promise<Client> {
    // Verificar que el cliente existe
    const existing = await this.clientRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Cliente con ID ${id} no encontrado`);
    }

    const updated = await this.clientRepository.update(id, {
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      cuit: input.cuit,
      fiscalName: input.fiscalName,
      ivaCondition: input.ivaCondition,
      hasCurrentAccount: input.hasCurrentAccount,
      creditLimit: input.creditLimit,
      notes: input.notes,
    });

    return updated;
  }
}
