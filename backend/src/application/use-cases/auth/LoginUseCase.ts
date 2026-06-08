import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UnauthorizedError } from '../../../shared/errors/AppError';
import { LoginRequestDTO, LoginResponseDTO } from '../../dtos/auth/LoginDTO';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../infrastructure/config/env';

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByUsername(request.username);

    if (!user || !user.active) {
      throw new UnauthorizedError('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generar tokens
    const payload = { id: user.id, username: user.username, role: user.role };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRATION as any,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refreshToken = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRATION as any,
    });

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }
}
