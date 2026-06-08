import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { CreateQuoteSchema, QuoteFiltersSchema } from '../../../application/dtos/quotes/QuoteDTO';

export async function quoteRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const filters = QuoteFiltersSchema.parse(request.query);
    const result = await container.useCases.listQuotesUseCase.execute(filters);
    return reply.send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await container.useCases.getQuoteUseCase.execute(id);
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = CreateQuoteSchema.parse(request.body);
    const createdBy = ((request as any).user as { id: string }).id;
    const result = await container.useCases.createQuoteUseCase.execute(data, createdBy);
    return reply.code(201).send(result);
  });

  fastify.post('/:id/convert', async (request, reply) => {
    const { id } = request.params as { id: string };
    const createdBy = ((request as any).user as { id: string }).id;
    const result = await container.useCases.convertQuoteToOrderUseCase.execute(id, createdBy);
    return reply.send(result);
  });
}
