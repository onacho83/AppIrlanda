import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware';
import { container } from '../../config/container';
import { AppError } from '../../../shared/errors/AppError';

export async function invoiceRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  // Generar factura
  fastify.post('/', async (request, reply) => {
    const schema = z.object({
      clientId: z.string().uuid(),
      orderIds: z.array(z.string().uuid()).min(1),
    });

    const data = schema.parse(request.body);
    const userId = (request as any).user.id;

    const useCase = container.resolve('generateInvoiceUseCase');
    const result = await useCase.execute({ ...data, userId });
    
    return reply.status(201).send({ data: result });
  });

  // Generar nota de crédito
  fastify.post('/:id/credit-note', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const userId = (request as any).user.id;

    const useCase = container.resolve('generateCreditNoteUseCase');
    const result = await useCase.execute(id, userId);
    
    return reply.status(201).send({ data: result });
  });

  // Obtener listado de facturas
  fastify.get('/', async (request, reply) => {
    const querySchema = z.object({
      clientId: z.string().uuid().optional(),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
    });

    const filters = querySchema.parse(request.query);
    const repo = container.resolve('invoiceRepository');
    const result = await repo.findAll(filters);

    return { data: result.data, total: result.total, page: filters.page, limit: filters.limit };
  });

  // Obtener factura por ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const repo = container.resolve('invoiceRepository');
    
    const invoice = await repo.findById(id);
    if (!invoice) throw new AppError('Factura no encontrada', 404);

    return { data: invoice };
  });
}
