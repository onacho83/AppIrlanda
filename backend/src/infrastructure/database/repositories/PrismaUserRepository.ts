import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User, Role } from '../../../domain/entities/User';
import { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findByUsername(username: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { username } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async create(user: User): Promise<User> {
    const data = await this.prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        password_hash: user.passwordHash,
        name: user.name,
        role: user.role,
        active: user.active,
      },
    });
    return this.toDomain(data);
  }

  async update(user: User): Promise<User> {
    const data = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        username: user.username,
        password_hash: user.passwordHash,
        name: user.name,
        role: user.role,
        active: user.active,
      },
    });
    return this.toDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const data = await this.prisma.user.findMany();
    return data.map(this.toDomain);
  }

  private toDomain(data: any): User {
    return new User(
      data.id,
      data.username,
      data.password_hash,
      data.name,
      data.role as Role,
      data.active,
      data.created_at
    );
  }
}
