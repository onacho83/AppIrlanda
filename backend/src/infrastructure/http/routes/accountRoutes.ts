import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { z } from 'zod';

export async function accountRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/client/:clientId/statement', async (request, reply) => {
    const { clientId } = request.params as { clientId: string };
    const result = await container.useCases.getClientStatementUseCase.execute(clientId);
    return reply.send(result);
  });
}
