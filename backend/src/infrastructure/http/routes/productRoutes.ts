import { FastifyInstance } from 'fastify';
import { container } from '../../config/container';
import { authMiddleware } from '../middlewares/authMiddleware';
import { ProductFiltersInput, CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput, ProductFiltersSchema, CreateProductSchema, UpdateProductSchema, CreateCategorySchema, UpdateCategorySchema } from '../../../application/dtos/products/ProductDTO';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', async (request, reply) => {
    const filters = ProductFiltersSchema.parse(request.query);
    const result = await container.useCases.listProductsUseCase.execute(filters);
    return reply.send(result);
  });

  fastify.get('/categories', async (request, reply) => {
    const result = await container.useCases.listCategoriesUseCase.execute();
    return reply.send(result);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await container.repositories.productRepository.findById(id);
    return reply.send(result);
  });

  fastify.post('/', async (request, reply) => {
    const data = CreateProductSchema.parse(request.body);
    const result = await container.useCases.createProductUseCase.execute(data);
    return reply.code(201).send(result);
  });

  fastify.post('/categories', async (request, reply) => {
    const data = CreateCategorySchema.parse(request.body);
    const result = await container.useCases.createCategoryUseCase.execute(data);
    return reply.code(201).send(result);
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = UpdateProductSchema.parse(request.body);
    const result = await container.useCases.updateProductUseCase.execute(id, data);
    return reply.send(result);
  });

  fastify.put('/categories/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = UpdateCategorySchema.parse(request.body);
    const result = await container.repositories.productRepository.updateCategory(id, data);
    return reply.send(result);
  });
}
