import { PrismaClient, Prisma } from '@prisma/client';
import { IClientRepository } from '../../../domain/repositories/IClientRepository';
import { Client } from '../../../domain/entities/Client';

export class PrismaClientRepository implements IClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Client | null> {
    const data = await this.prisma.client.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findAll(filters?: any): Promise<{ data: Client[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {};
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters?.hasCurrentAccount !== undefined) {
      where.has_current_account = filters.hasCurrentAccount;
    }

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: data.map(this.toDomain),
      total,
    };
  }

  async search(query: string): Promise<Client[]> {
    const data = await this.prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
    return data.map(this.toDomain);
  }

  async findByTrackingToken(token: string): Promise<Client | null> {
    const data = await this.prisma.client.findUnique({ where: { tracking_token: token } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async create(client: Client): Promise<Client> {
    const data = await this.prisma.client.create({
      data: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        cuit: client.cuit,
        fiscal_name: client.fiscalName,
        iva_condition: client.ivaCondition as any,
        has_current_account: client.hasCurrentAccount,
        credit_limit: client.creditLimit,
        tracking_token: client.trackingToken,
        notes: client.notes,
      },
    });
    return this.toDomain(data);
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        cuit: data.cuit,
        fiscal_name: data.fiscalName,
        iva_condition: data.ivaCondition as any,
        has_current_account: data.hasCurrentAccount,
        credit_limit: data.creditLimit,
        notes: data.notes,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }

  private toDomain(data: any): Client {
    return new Client(
      data.id,
      data.name,
      data.phone,
      data.email,
      data.address,
      data.cuit,
      data.fiscal_name,
      data.iva_condition,
      data.has_current_account,
      data.credit_limit ? Number(data.credit_limit) : null,
      data.tracking_token,
      data.notes,
      data.created_at,
      data.updated_at
    );
  }
}
