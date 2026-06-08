import { Client } from '../entities/Client';

/** Filtros para listar clientes con paginación */
export interface ClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  hasCurrentAccount?: boolean;
}

/** Datos necesarios para crear un nuevo cliente */
export interface CreateClientDTO {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  cuit?: string | null;
  fiscalName?: string | null;
  ivaCondition?: string;
  hasCurrentAccount?: boolean;
  creditLimit?: number | null;
  notes?: string | null;
}

/** Datos opcionales para actualizar un cliente existente */
export interface UpdateClientDTO {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  cuit?: string | null;
  fiscalName?: string | null;
  ivaCondition?: string;
  hasCurrentAccount?: boolean;
  creditLimit?: number | null;
  notes?: string | null;
}

/**
 * Contrato del repositorio de clientes.
 * Define las operaciones de persistencia disponibles para la entidad Client.
 */
export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findAll(filters?: ClientFilters): Promise<{ data: Client[]; total: number }>;
  search(query: string): Promise<Client[]>;
  findByTrackingToken(token: string): Promise<Client | null>;
  create(client: CreateClientDTO): Promise<Client>;
  update(id: string, data: UpdateClientDTO): Promise<Client>;
  delete(id: string): Promise<void>;
}
