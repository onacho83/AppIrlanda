import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../../shared/errors/AppError';
import { ZodError } from 'zod';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: 'error',
      message: 'Error de validación',
      errors: error.format(),
    });
  }

  // Errores propios de Fastify (e.g., Rate limit, Payload too large)
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      status: 'error',
      message: error.message,
    });
  }

  // Error inesperado
  return reply.status(500).send({
    status: 'error',
    message: 'Error interno del servidor',
  });
};
