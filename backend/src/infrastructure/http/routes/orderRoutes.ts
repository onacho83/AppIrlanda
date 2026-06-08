import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { CreateOrderSchema, UpdateOrderSchema, UpdateOrderStatusSchema, OrderFiltersSchema } from '../../../application/dtos/orders/OrderDTO';

export async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const filters = OrderFiltersSchema.parse(request.query);
    const result = await container.useCases.listOrdersUseCase.execute(filters);
    return reply.send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await container.useCases.getOrderDetailUseCase.execute(id);
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = CreateOrderSchema.parse(request.body);
    const createdBy = (request as any).user.id;
    const result = await container.useCases.createOrderUseCase.execute(data, createdBy);
    return reply.code(201).send(result);
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = UpdateOrderSchema.parse(request.body);
    const updateData = {
      ...data,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
    };
    const result = await container.repositories.orderRepository.update(id, updateData);
    return reply.send(result);
  });

  fastify.patch('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = UpdateOrderStatusSchema.parse(request.body);
    const changedBy = (request as any).user.id;
    
    const result = await container.useCases.updateOrderStatusUseCase.execute(id, data, changedBy);
    return reply.send(result);
  });
}
