import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RegisterPaymentSchema, UpdatePaymentSchema } from '../../../application/dtos/payments/PaymentDTO';

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 20, orderId } = request.query as any;
    if (orderId) {
      const result = await container.repositories.paymentRepository.findByOrder(orderId as string);
      return reply.send({ data: result, total: result.length });
    }
    const result = await container.repositories.paymentRepository.findAll(Number(page), Number(limit));
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = RegisterPaymentSchema.parse(request.body);
    const registeredBy = (request as any).user.id;
    const result = await container.useCases.registerPaymentUseCase.execute(data, registeredBy);
    return reply.code(201).send(result);
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as any;
    const data = UpdatePaymentSchema.parse(request.body);
    const result = await container.useCases.updatePaymentUseCase.execute(id, data);
    return reply.send(result);
  });
}
