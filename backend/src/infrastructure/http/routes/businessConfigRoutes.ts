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
      businessName: z.string().nullish(),
      cuit: z.string().nullish(),
      ivaCondition: z.string().nullish(),
      address: z.string().nullish(),
      phone: z.string().nullish(),
      email: z.string().nullish(),
      logoPath: z.string().nullish(),
      arcaSalePoint: z.number().nullish(),
      arcaCert: z.string().nullish(),
      arcaKey: z.string().nullish(),
      arcaProduction: z.boolean().nullish(),
      grossIncome: z.string().nullish(),
      activityStartDate: z.string().nullish(),
      commercialLegend: z.string().nullish(),
    });

    const data = schema.parse(request.body);
    const repo = container.resolve('businessConfigRepository');
    
    const config = await repo.updateConfig(data);
    return { data: config };
  });
}
