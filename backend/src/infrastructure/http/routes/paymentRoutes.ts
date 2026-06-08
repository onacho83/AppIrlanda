import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { RegisterPaymentSchema } from '../../../application/dtos/payments/PaymentDTO';

export async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const { page = 1, limit = 20 } = request.query as any;
    const result = await container.repositories.paymentRepository.findAll(Number(page), Number(limit));
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = RegisterPaymentSchema.parse(request.body);
    const registeredBy = (request as any).user.id;
    const result = await container.useCases.registerPaymentUseCase.execute(data, registeredBy);
    return reply.code(201).send(result);
  });
}
