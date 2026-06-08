import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';
import { ClientFiltersInput } from '../../dtos/clients/ClientDTO';

/** Resultado paginado de la lista de clientes */
export interface ListClientsResult {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Caso de uso: Listar clientes con paginación, filtros y búsqueda.
 */
export class ListClientsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(filters: ClientFiltersInput): Promise<ListClientsResult> {
    const { data, total } = await this.clientRepository.findAll({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      hasCurrentAccount: filters.hasCurrentAccount,
    });

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
    };
  }
}
