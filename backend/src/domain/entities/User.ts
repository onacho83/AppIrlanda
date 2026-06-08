export enum Role {
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR'
}

export class User {
  constructor(
    public readonly id: string,
    public username: string,
    public passwordHash: string,
    public name: string,
    public role: Role,
    public active: boolean,
    public readonly createdAt: Date
  ) {}

  public isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
}
