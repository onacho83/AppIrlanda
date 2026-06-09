import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { container } from '../../config/container';

export async function businessConfigRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authMiddleware);

  // Obtener configuracin
  fastify.get('/', async (request, reply) => {
    const repo = container.resolve('businessConfigRepository');
    const config = await repo.getConfig();
    return { data: config };
  });

  // Actualizar configuracin (Solo ADMIN)
  fastify.put('/', { preHandler: roleMiddleware(['ADMIN']) }, async (request, reply) => {
    const schema = z.object({
      businessName: z.string().optional(),
      cuit: z.string().optional(),
      ivaCondition: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      logoPath: z.string().optional(),
      arcaSalePoint: z.number().optional(),
      arcaCert: z.string().optional(),
      arcaKey: z.string().optional(),
      arcaProduction: z.boolean().optional(),
    });

    const data = schema.parse(request.body);
    const repo = container.resolve('businessConfigRepository');
    
    const config = await repo.updateConfig(data);
    return { data: config };
  });
}
