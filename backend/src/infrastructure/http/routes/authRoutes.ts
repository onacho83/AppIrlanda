import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { container } from '../../config/container';
import { LoginRequestSchema } from '../../../application/dtos/auth/LoginDTO';

export const authRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post('/login', async (request, reply) => {
    // Validar body
    const data = LoginRequestSchema.parse(request.body);
    
    // Ejecutar caso de uso
    const result = await container.useCases.loginUseCase.execute(data);
    
    return reply.status(200).send({
      status: 'success',
      data: result
    });
  });

  server.post('/refresh', async (request, reply) => {
    return { status: 'success', message: 'Ruta de refresh en construcción' };
  });
};
