import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { env } from '../config/env';
import { errorHandler } from './middlewares/errorHandler';
import { prisma } from '../database/prisma/prismaClient';
import { authRoutes } from './routes/authRoutes';

const server = fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  },
});

const startServer = async () => {
  try {
    // 1. Plugins
    await server.register(cors, {
      origin: '*', // Ajustar en producción
    });

    await server.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // 2. Middlewares globales
    server.setErrorHandler(errorHandler);

    // 3. Rutas
    server.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    server.register(authRoutes, { prefix: '/api/auth' });
    server.register((await import('./routes/clientRoutes')).clientRoutes, { prefix: '/api/clients' });
    server.register((await import('./routes/productRoutes')).productRoutes, { prefix: '/api/products' });
    server.register((await import('./routes/orderRoutes')).orderRoutes, { prefix: '/api/orders' });
    server.register((await import('./routes/quoteRoutes')).quoteRoutes, { prefix: '/api/quotes' });
    server.register((await import('./routes/paymentRoutes')).paymentRoutes, { prefix: '/api/payments' });
    server.register((await import('./routes/accountRoutes')).accountRoutes, { prefix: '/api/accounts' });
    server.register((await import('./routes/invoiceRoutes')).invoiceRoutes, { prefix: '/api/invoices' });
    server.register((await import('./routes/businessConfigRoutes')).businessConfigRoutes, { prefix: '/api/config' });

    // 4. Conexión a BD
    await prisma.$connect();
    server.log.info('Conectado a la base de datos PostgreSQL');

    // 5. Iniciar servidor
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    server.log.info(`Servidor escuchando en http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

startServer();
