import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ClientFiltersInput, CreateClientInput, UpdateClientInput, ClientFiltersSchema, CreateClientSchema, UpdateClientSchema } from '../../../application/dtos/clients/ClientDTO';

export async function clientRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const filters = ClientFiltersSchema.parse(request.query);
    const result = await container.useCases.listClientsUseCase.execute(filters);
    return reply.send(result);
  });

  fastify.get('/search', async (request, reply) => {
    const query = request.query as any;
    const result = await container.repositories.clientRepository.search(query.q || '');
    return reply.send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await container.useCases.getClientDetailUseCase.execute(id);
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = CreateClientSchema.parse(request.body);
    const result = await container.useCases.createClientUseCase.execute(data);
    return reply.code(201).send(result);
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = UpdateClientSchema.parse(request.body);
    const result = await container.useCases.updateClientUseCase.execute(id, data);
    return reply.send(result);
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await container.repositories.clientRepository.delete(id);
    return reply.code(204).send();
  });
}
