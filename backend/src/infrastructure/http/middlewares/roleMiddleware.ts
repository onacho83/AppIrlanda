import { FastifyReply, FastifyRequest } from 'fastify';
import { ForbiddenError } from '../../../shared/errors/AppError';

export const roleMiddleware = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenError('No tienes permisos para realizar esta acción');
    }
  };
};
