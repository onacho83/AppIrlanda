import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  ARCA_PRODUCTION: z.coerce.boolean().default(false),
  // Opcionales por ahora
  ARCA_CUIT: z.string().optional(),
  ARCA_SALE_POINT: z.coerce.number().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Variables de entorno inválidas:', _env.error.format());
  throw new Error('Configuración de variables de entorno inválida');
}

export const env = _env.data;
