import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { CreateClientInput } from '../../dtos/clients/ClientDTO';

/**
 * Caso de uso: Crear un nuevo cliente.
 * Genera el trackingToken automáticamente (delegado al repositorio/BD).
 */
export class CreateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(input: CreateClientInput): Promise<Client> {
    const client = await this.clientRepository.create({
      name: input.name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      address: input.address ?? null,
      cuit: input.cuit ?? null,
      fiscalName: input.fiscalName ?? null,
      ivaCondition: input.ivaCondition,
      hasCurrentAccount: input.hasCurrentAccount,
      creditLimit: input.creditLimit ?? null,
      notes: input.notes ?? null,
    });

    return client;
  }
}
